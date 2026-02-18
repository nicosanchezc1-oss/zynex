package com.example.zenithlauncher

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.util.Base64
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 1. Configurar WebView a pantalla completa sin XML layout
        webView = WebView(this)
        setContentView(webView)

        // 2. Configurar ajustes del WebView
        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.allowFileAccess = true
        webSettings.mediaPlaybackRequiresUserGesture = false
        
        // Optimización para TV (Hardware Acceleration)
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        
        // Deshabilitar scrollbars nativos (ya los manejamos en CSS)
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false

        // 3. Inyectar la interfaz nativa ("Android" será el objeto window.Android en JS)
        webView.addJavascriptInterface(WebAppInterface(this), "Android")

        // 4. Cargar la app de React desde assets
        webView.webViewClient = WebViewClient()
        webView.loadUrl("file:///android_asset/index.html")
        
        // 5. Ocultar barras de sistema (Immersive Mode para TV)
        hideSystemUI()
    }

    override fun onResume() {
        super.onResume()
        hideSystemUI() // Re-ocultar si volvemos de otra app
    }
    
    // Evita que el botón "Atrás" cierre la app si es el Launcher
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            // No hacer nada, estamos en Home
        }
    }

    private fun hideSystemUI() {
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN)
    }

    // ==========================================
    // CLASE INTERFAZ (El Puente JS <-> Kotlin)
    // ==========================================
    class WebAppInterface(private val mContext: Context) {

        @JavascriptInterface
        fun getInstalledApps(): String {
            val pm = mContext.packageManager
            
            // Queremos apps que sean lanzables (tengan icono en el cajón de apps)
            val intent = Intent(Intent.ACTION_MAIN, null)
            intent.addCategory(Intent.CATEGORY_LAUNCHER)
            
            // También buscamos apps específicas de TV (Leanback)
            val tvIntent = Intent(Intent.ACTION_MAIN, null)
            tvIntent.addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER)

            val apps = pm.queryIntentActivities(intent, 0)
            val tvApps = pm.queryIntentActivities(tvIntent, 0)
            
            // Unimos listas y eliminamos duplicados
            val allApps = (apps + tvApps).distinctBy { it.activityInfo.packageName }
            
            val jsonArray = JSONArray()

            for (resolveInfo in allApps) {
                // Filtramos nuestra propia app para no mostrarnos a nosotros mismos
                if (resolveInfo.activityInfo.packageName == mContext.packageName) continue

                try {
                    val appInfo = resolveInfo.activityInfo.applicationInfo
                    val label = resolveInfo.loadLabel(pm).toString()
                    val packageName = resolveInfo.activityInfo.packageName
                    
                    // Convertir Icono a Base64
                    val iconDrawable = resolveInfo.loadIcon(pm)
                    val iconBase64 = drawableToBase64(iconDrawable)

                    val jsonObject = JSONObject()
                    jsonObject.put("label", label)
                    jsonObject.put("packageName", packageName)
                    // Prefijo necesario para que <img> en HTML lo entienda
                    jsonObject.put("icon", "data:image/png;base64,$iconBase64")

                    jsonArray.put(jsonObject)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            return jsonArray.toString()
        }

        @JavascriptInterface
        fun launchApp(packageName: String): Boolean {
            return try {
                val pm = mContext.packageManager
                // Intentar obtener intent de Leanback (TV) primero
                var intent = pm.getLeanbackLaunchIntentForPackage(packageName)
                
                // Si no existe, intentar intent normal (Móvil)
                if (intent == null) {
                    intent = pm.getLaunchIntentForPackage(packageName)
                }

                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    mContext.startActivity(intent)
                    true
                } else {
                    false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }

        // ==========================================
        // FUNCIÓN AUXILIAR: DRAWABLE A BASE64
        // ==========================================
        private fun drawableToBase64(drawable: Drawable): String {
            val bitmap: Bitmap = if (drawable is BitmapDrawable) {
                drawable.bitmap
            } else {
                // Manejar AdaptiveIconDrawable y VectorDrawable
                val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 96
                val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 96
                
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(bitmap)
                drawable.setBounds(0, 0, canvas.width, canvas.height)
                drawable.draw(canvas)
                bitmap
            }

            val byteArrayOutputStream = ByteArrayOutputStream()
            // Comprimir a PNG (calidad 100)
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
            val byteArray = byteArrayOutputStream.toByteArray()
            
            return Base64.encodeToString(byteArray, Base64.NO_WRAP)
        }
    }
}