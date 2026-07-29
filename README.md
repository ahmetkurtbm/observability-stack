# Observability Stack (Prometheus + Loki + Tempo + Grafana + OTel Collector)

Merkezi, tüm Vercel projelerinin (GateHub, ReceiptFlow, TestMetrix, ...) metrik/log/trace verisini push ettiği ortak gözlemlenebilirlik altyapısı. Detaylı mimari kararları için proje planına bakın.

## Neden push-based?

Uygulamalar Vercel'de serverless çalıştığından Prometheus'un klasik pull/scrape modeli kullanılamaz. Bunun yerine her uygulama OpenTelemetry SDK'sı ile telemetriyi (metrik/log/trace) `otel-collector`'a **push** eder; collector bunları Prometheus, Loki ve Tempo'ya dağıtır.

## Kurulum (VPS üzerinde)

1. DNS: `GRAFANA_DOMAIN`, `OTEL_DOMAIN`, `OTEL_GRPC_DOMAIN` için VPS IP'sine A kaydı ekle.
2. `.env.example` dosyasını `.env` olarak kopyala, gerçek değerleri doldur.
3. OTLP ingest için kullanıcı adı/şifre oluştur (tüm uygulamalar bu tek kimlik bilgisini kullanır — proje bazlı ayrım `service.name` resource attribute'u ile yapılır, ayrı token gerekmez):
   ```bash
   docker run --rm httpd:2.4-alpine htpasswd -Bbn otel-ingest "GUCLU_BIR_SIFRE" > otel-collector/htpasswd
   ```
4. Ayağa kaldır:
   ```bash
   docker compose up -d
   ```
5. `https://GRAFANA_DOMAIN` adresine gidip `admin` / `.env`'deki şifre ile giriş yap. Prometheus/Loki/Tempo datasource'ları otomatik provision edilmiş olmalı (Connections → Data sources).

## Bir uygulamayı bağlamak

`examples/gatehub-otel/` klasöründeki örneğe bakın — Next.js projesine `instrumentation.ts` eklemek ve birkaç paket kurmaktan ibaret. Diğer projelere aynı dosyayı kopyalayıp sadece `serviceName` değerini değiştirmen yeterli.

Ortam değişkenleri (her Vercel projesinde ayrı ayrı tanımlanır):
```
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.yourdomain.com
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64(otel-ingest:GUCLU_BIR_SIFRE)>
OTEL_SERVICE_NAME=gatehub
```

## Doğrulama

- Grafana → Explore → Loki: `{service_name="gatehub"}` sorgusu ile logların geldiğini gör.
- Grafana → Explore → Prometheus: `{__name__=~".+", service_name="gatehub"}` ile metriklerin geldiğini gör.
- Grafana → Explore → Tempo: son trace'leri ara, bir trace açıp "Logs for this span" ile Loki'ye, "Node graph" ile servis haritasına geçebildiğini doğrula.

## Yeni proje eklemek

Yeni bir Vercel projesine sadece `examples/gatehub-otel/instrumentation.ts` dosyasını kopyala, `OTEL_SERVICE_NAME`'i değiştir, aynı `OTEL_EXPORTER_OTLP_ENDPOINT`/`OTEL_EXPORTER_OTLP_HEADERS` env'lerini tanımla. Altyapıda hiçbir değişiklik gerekmez.

## Ölçek büyürse

- `prometheus` servisini `grafana/mimir`e çevir (yatay ölçeklenebilir remote-write hedefi).
- Loki/Tempo storage backend'ini `filesystem`'den S3-uyumlu bir object storage'a (Cloudflare R2, Backblaze B2) taşı.
- `otel-collector`'ı birden fazla instance + basit bir load balancer arkasına al.
