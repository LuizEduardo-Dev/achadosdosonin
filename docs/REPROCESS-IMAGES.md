# Reprocessamento opcional de imagens existentes

As imagens já enviadas ao bucket `achados-images` **não precisam ser reprocessadas**: os cards da vitrine já usam `aspect-ratio: 1 / 1`, fundo branco (`--surface`), `padding: 8px` e `object-fit: contain` para garantir alinhamento uniforme sem CLS.

Novos uploads feitos pelo admin já são convertidos automaticamente no navegador para:

- canvas quadrado `800x800`;
- fundo branco (`#FFFFFF`, inclusive para PNG transparente);
- produto centralizado com ~4% de margem interna;
- WebP (fallback JPEG) com qualidade inicial `0.85` e alvo de até `150 KB`.

Caso queira padronizar fisicamente arquivos antigos no Storage em algum momento (por exemplo, para reduzir tráfego de rede em fotos muito pesadas), você pode rodar manualmente o script abaixo em um ambiente local com `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e a dependência `sharp` instalada temporariamente (`npm install --no-save sharp @supabase/supabase-js`).

> **Importante:** nunca commite a `SUPABASE_SERVICE_ROLE_KEY` no repositório. Faça backup antes de sobrescrever objetos em produção.

## Script opcional de referência (`reprocess-images.mjs`)

```js
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "achados-images";
const SIZE = 800;
const INNER_SIZE = Math.round(SIZE * 0.92); // 4% margin on each side

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data: achados, error } = await supabase
  .from("achados")
  .select("id, image_path");

if (error) throw error;

for (const item of achados ?? []) {
  if (!item.image_path || item.image_path.startsWith("http")) continue;

  const { data: downloaded, error: dlError } = await supabase.storage
    .from(BUCKET)
    .download(item.image_path);

  if (dlError || !downloaded) {
    console.warn(`Ignorando ${item.image_path}:`, dlError?.message);
    continue;
  }

  const inputBuffer = Buffer.from(await downloaded.arrayBuffer());

  const resized = await sharp(inputBuffer)
    .rotate()
    .resize(INNER_SIZE, INNER_SIZE, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: "#FFFFFF" })
    .toBuffer();

  const canvasBuffer = await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .webp({ quality: 85 })
    .toBuffer();

  const newPath = item.image_path.replace(/\.[^.]+$/, ".webp");

  const { error: upError } = await supabase.storage
    .from(BUCKET)
    .upload(newPath, canvasBuffer, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });

  if (upError) {
    console.error(`Erro ao enviar ${newPath}:`, upError.message);
    continue;
  }

  if (newPath !== item.image_path) {
    await supabase
      .from("achados")
      .update({ image_path: newPath })
      .eq("id", item.id);
  }

  console.log(`Processado: ${newPath} (${Math.round(canvasBuffer.length / 1024)} KB)`);
}
```
