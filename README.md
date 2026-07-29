# Observability — Grafana Cloud (ücretsiz) ile GateHub, ReceiptFlow, TestMetrix vb.

Tüm Vercel projelerinin metrik/log/trace verisini tek bir yerde görmek için, ücretsiz bir Grafana Cloud hesabı kullanıyoruz. **Kendi sunucu, domain veya Docker kurulumu gerekmiyor** — Prometheus (Mimir), Loki, Tempo ve Grafana'nın hepsi Grafana Cloud'un ücretsiz tier'ında hazır geliyor.

> Bu repoda ayrıca `docker-compose.yml`, `caddy/`, `otel-collector/`, `prometheus/`, `loki/`, `tempo/` gibi kendi sunucunda (VPS) barındırma için hazırlanmış dosyalar da var. Ücretsiz yol seçildiği için bunlar **şu an kullanılmıyor**, ileride kendi sunucunu kurmak istersen referans olarak duruyor.

## Neden push-based?

Uygulamalar Vercel'de serverless çalıştığından Prometheus'un klasik pull/scrape modeli kullanılamaz. Bunun yerine her uygulama OpenTelemetry SDK'sı ile telemetriyi (metrik/log/trace) doğrudan Grafana Cloud'un OTLP adresine **push** eder.

## Kurulum (ücretsiz, sunucusuz)

1. [grafana.com/auth/sign-up](https://grafana.com/auth/sign-up) adresinden e-posta ile ücretsiz kaydol (kredi kartı istemez). Kayıt sonrası otomatik bir "stack" (Grafana instance'ı) oluşur.
2. Grafana Cloud portalında stack'ine gir → **Configure / Connections → OpenTelemetry**. Burada sana özel hazır olarak şunlar verilir:
   - `OTEL_EXPORTER_OTLP_ENDPOINT` (OTLP gateway URL'i)
   - `Authorization: Basic <base64>` header'ı (Instance ID + API Token'dan otomatik üretilmiş)
3. Bu iki değeri bir sonraki adımda kullanacaksın.

## Bir uygulamayı bağlamak (GateHub örneği)

`examples/gatehub-otel/` klasöründeki dosyalara bak:
- `instrumentation.ts` → Next.js projesinin köküne kopyala.
- `npm i @vercel/otel` çalıştır.
- Vercel projesinin **Settings → Environment Variables** kısmına ekle:
  ```
  OTEL_SERVICE_NAME=gatehub
  OTEL_EXPORTER_OTLP_ENDPOINT=<Grafana Cloud'dan aldığın URL>
  OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <Grafana Cloud'dan aldığın base64 token>
  ```
- Deploy et.

## Doğrulama

- Grafana Cloud → **Explore** → Prometheus datasource: `{service_name="gatehub"}` sorgusuyla metrik geldiğini gör.
- Grafana Cloud → **Explore** → Loki datasource: `{service_name="gatehub"}` sorgusuyla logların geldiğini gör.
- Grafana Cloud → **Explore** → Tempo datasource: son trace'leri ara, birini açıp detaylarını incele.
- Grafana Cloud'un otomatik "Application Observability" dashboard'una bak — istek sayısı/hata oranı/gecikme grafikleri panel yazmadan hazır gelir.

## Yeni proje eklemek

`examples/gatehub-otel/instrumentation.ts` dosyasını yeni projeye kopyala, sadece `OTEL_SERVICE_NAME`'i değiştir (`receiptflow`, `testmetrix` vb.), aynı `OTEL_EXPORTER_OTLP_ENDPOINT`/`OTEL_EXPORTER_OTLP_HEADERS` değerlerini kullan. Grafana Cloud tarafında hiçbir ek işlem gerekmez — aynı ücretsiz hesap tüm projeleri kabul eder.

## Ücretsiz kota

Grafana Cloud Free tier: ~10.000 metrik serisi, 50GB log, 50GB trace/ay, 14 gün saklama, 3 kullanıcı, kredi kartı istemiyor, süresiz. Birkaç hobi projesi için fazlasıyla yeterli. Kota aşılırsa veri toplamayı durdurur, otomatik ücretli plana geçmez.

## İleride kendi sunucunu kurmak istersen

Bu repodaki `docker-compose.yml` + `otel-collector/` + `prometheus/` + `loki/` + `tempo/` + `caddy/` dosyaları tam bağımsız bir self-hosted alternatif sunuyor (bir VPS + domain gerektirir). Kurulum adımları için repo geçmişindeki önceki README versiyonuna bakabilirsin.
