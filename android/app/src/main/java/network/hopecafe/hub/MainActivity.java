package network.hopecafe.hub;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int CAMERA_PERMISSION_REQUEST_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Check and request runtime camera permission
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                new String[]{Manifest.permission.CAMERA},
                CAMERA_PERMISSION_REQUEST_CODE
            );
        }

        // Configure WebView to automatically grant camera permissions for HTML5 getUserMedia
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> {
                        request.grant(request.getResources());
                    });
                }
            });

            // Route to role-specific entry point on fresh launch
            if (savedInstanceState == null) {
                String baseUrl = "https://hopepartners.hopelife.in";
                String role = BuildConfig.APP_ROLE;
                String targetUrl = baseUrl;
                if ("cafeadmin".equalsIgnoreCase(role)) {
                    targetUrl = baseUrl + "/admin/login";
                } else if ("superadmin".equalsIgnoreCase(role)) {
                    targetUrl = baseUrl + "/super-admin/login";
                } else if ("marketing".equalsIgnoreCase(role)) {
                    targetUrl = baseUrl + "/marketing/login";
                } else if ("partner".equalsIgnoreCase(role)) {
                    targetUrl = baseUrl + "/login";
                }
                webView.loadUrl(targetUrl);
            }
        }
    }
}
