/*
 * Copyright 2026 PDFfULL.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */
package app.vercel.pdffull.twa;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

/**
 * Recebe Intents ACTION_VIEW / ACTION_SEND com mime type application/pdf,
 * envia o arquivo ao endpoint /api/upload/temp-pdf e abre /leitor?pdfUrl=...
 * dentro da TWA.
 *
 * Fluxo:
 * 1. Extrai URI do arquivo do Intent.
 * 2. Lê bytes via ContentResolver (AsyncTask — off-main-thread).
 * 3. POST multipart ao servidor → recebe URL pública.
 * 4. Lança LauncherActivity passando EXTRA_TARGET_URL com a URL final.
 */
public class PdfHandlerActivity extends Activity {

    private static final String TAG = "PdfHandler";
    private static final String UPLOAD_ENDPOINT =
            "https://www.pdf-full.com/api/upload/temp-pdf";
    private static final long MAX_SIZE = 20L * 1024 * 1024; // 20 MB
    static final String EXTRA_TARGET_URL = "app.vercel.pdffull.twa.TARGET_URL";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Uri uri = extractUri(getIntent());
        if (uri == null) {
            Toast.makeText(this, "Arquivo não encontrado", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        Toast.makeText(this, "Preparando PDF...", Toast.LENGTH_SHORT).show();
        new UploadTask(this).execute(uri);
    }

    private static Uri extractUri(Intent intent) {
        if (intent == null) return null;
        String action = intent.getAction();
        if (Intent.ACTION_VIEW.equals(action)) {
            return intent.getData();
        }
        if (Intent.ACTION_SEND.equals(action)) {
            return intent.getParcelableExtra(Intent.EXTRA_STREAM);
        }
        return null;
    }

    void onUploadComplete(String url) {
        if (url == null) {
            Toast.makeText(this, "Falha ao enviar o PDF", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        try {
            String encoded = URLEncoder.encode(url, "UTF-8");
            String target = "https://www.pdf-full.com/leitor?pdfUrl=" + encoded;
            Intent launch = new Intent(this, LauncherActivity.class);
            launch.setData(Uri.parse(target));
            launch.putExtra(EXTRA_TARGET_URL, target);
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(launch);
        } catch (Exception e) {
            Log.e(TAG, "Falha ao lançar LauncherActivity", e);
            Toast.makeText(this, "Erro ao abrir leitor", Toast.LENGTH_LONG).show();
        }
        finish();
    }

    private static class UploadTask extends AsyncTask<Uri, Void, String> {
        private final PdfHandlerActivity activity;

        UploadTask(PdfHandlerActivity activity) {
            this.activity = activity;
        }

        @Override
        protected String doInBackground(Uri... uris) {
            Uri uri = uris[0];
            try {
                byte[] bytes = readBytes(uri);
                if (bytes == null || bytes.length == 0) return null;
                if (bytes.length > MAX_SIZE) {
                    Log.w(TAG, "PDF maior que 20MB, cancelando");
                    return null;
                }
                return uploadMultipart(bytes, inferName(uri));
            } catch (Exception e) {
                Log.e(TAG, "Erro ao processar PDF", e);
                return null;
            }
        }

        private byte[] readBytes(Uri uri) throws Exception {
            InputStream in = activity.getContentResolver().openInputStream(uri);
            if (in == null) return null;
            try (BufferedInputStream bis = new BufferedInputStream(in);
                 ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
                byte[] buf = new byte[8192];
                int n;
                long total = 0;
                while ((n = bis.read(buf)) != -1) {
                    total += n;
                    if (total > MAX_SIZE) return null;
                    bos.write(buf, 0, n);
                }
                return bos.toByteArray();
            }
        }

        private String inferName(Uri uri) {
            String path = uri.getLastPathSegment();
            if (path == null || path.isEmpty()) return "documento.pdf";
            if (!path.toLowerCase().endsWith(".pdf")) return path + ".pdf";
            return path;
        }

        @Override
        protected void onPostExecute(String url) {
            activity.onUploadComplete(url);
        }
    }

    private static String uploadMultipart(byte[] data, String filename) {
        String boundary = "----pdffull" + System.currentTimeMillis();
        HttpURLConnection conn = null;
        try {
            URL url = new URL(UPLOAD_ENDPOINT);
            conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setUseCaches(false);
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(15_000);
            conn.setReadTimeout(60_000);
            conn.setRequestProperty("Connection", "Keep-Alive");
            conn.setRequestProperty("Content-Type",
                    "multipart/form-data; boundary=" + boundary);

            try (DataOutputStream out = new DataOutputStream(conn.getOutputStream())) {
                String safeName = filename.replaceAll("[\"\\r\\n]", "_");
                out.writeBytes("--" + boundary + "\r\n");
                out.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\""
                        + safeName + "\"\r\n");
                out.writeBytes("Content-Type: application/pdf\r\n\r\n");
                out.write(data);
                out.writeBytes("\r\n--" + boundary + "--\r\n");
                out.flush();
            }

            int status = conn.getResponseCode();
            if (status < 200 || status >= 300) {
                Log.w(TAG, "Upload HTTP " + status);
                return null;
            }

            InputStream is = conn.getInputStream();
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[2048];
            int n;
            while ((n = is.read(buf)) != -1) bos.write(buf, 0, n);
            String body = bos.toString("UTF-8");

            // Parse simples: {"url":"..."}
            int idx = body.indexOf("\"url\"");
            if (idx < 0) return null;
            int start = body.indexOf('"', body.indexOf(':', idx) + 1);
            int end = body.indexOf('"', start + 1);
            if (start < 0 || end < 0) return null;
            return body.substring(start + 1, end).replace("\\/", "/");
        } catch (Exception e) {
            Log.e(TAG, "Upload falhou", e);
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }
}
