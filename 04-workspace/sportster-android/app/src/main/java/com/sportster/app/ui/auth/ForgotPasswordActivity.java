package com.sportster.app.ui.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.sportster.app.R;
import com.sportster.app.databinding.ActivityLoginBinding;

import com.google.android.material.textfield.TextInputLayout;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.button.MaterialButton;

import android.widget.ImageButton;
import android.widget.TextView;
import android.view.View;

import androidx.constraintlayout.widget.ConstraintLayout;

public class ForgotPasswordActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Build layout programmatically for simplicity
        // In production create activity_forgot_password.xml
        setContentView(buildLayout());
    }

    private View buildLayout() {
        // Simple inline layout — replace with XML in production
        android.widget.ScrollView scroll = new android.widget.ScrollView(this);
        scroll.setBackgroundColor(getColor(R.color.surface));

        android.widget.LinearLayout root = new android.widget.LinearLayout(this);
        root.setOrientation(android.widget.LinearLayout.VERTICAL);
        root.setPadding(dpToPx(24), dpToPx(64), dpToPx(24), dpToPx(40));

        TextView tvTitle = new TextView(this);
        tvTitle.setText("Forgot Password? 🔑");
        tvTitle.setTextSize(26f);
        tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
        tvTitle.setTextColor(getColor(R.color.text_primary));
        root.addView(tvTitle);

        TextView tvDesc = new TextView(this);
        tvDesc.setText("Enter your email address and we'll send you a link to reset your password.");
        tvDesc.setTextSize(14f);
        tvDesc.setTextColor(getColor(R.color.text_secondary));
        tvDesc.setLineSpacing(0, 1.4f);
        android.widget.LinearLayout.LayoutParams descParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
        descParams.topMargin = dpToPx(10);
        tvDesc.setLayoutParams(descParams);
        root.addView(tvDesc);

        TextInputLayout tilEmail = new TextInputLayout(this,
            null, com.google.android.material.R.attr.textInputOutlinedStyle);
        tilEmail.setHint("Email Address");
        android.widget.LinearLayout.LayoutParams emailParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
        emailParams.topMargin = dpToPx(32);
        tilEmail.setLayoutParams(emailParams);

        TextInputEditText etEmail = new TextInputEditText(tilEmail.getContext());
        etEmail.setInputType(android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        tilEmail.addView(etEmail);
        root.addView(tilEmail);

        MaterialButton btnSend = new MaterialButton(this);
        btnSend.setText("Send Reset Link");
        btnSend.setBackgroundColor(getColor(R.color.green));
        android.widget.LinearLayout.LayoutParams btnParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
        btnParams.topMargin = dpToPx(24);
        btnSend.setLayoutParams(btnParams);

        btnSend.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                tilEmail.setError("Enter a valid email");
                return;
            }
            tilEmail.setError(null);
            btnSend.setEnabled(false);
            btnSend.setText("Sending…");
            // TODO: API call
            v.postDelayed(() -> {
                Snackbar.make(v, "Reset link sent to " + email, Snackbar.LENGTH_LONG).show();
                btnSend.setEnabled(true);
                btnSend.setText("Send Reset Link");
            }, 1500);
        });
        root.addView(btnSend);

        TextView tvBack = new TextView(this);
        tvBack.setText("← Back to Login");
        tvBack.setTextColor(getColor(R.color.text_secondary));
        tvBack.setTextSize(14f);
        tvBack.setPadding(0, dpToPx(20), 0, 0);
        tvBack.setOnClickListener(v -> finish());
        root.addView(tvBack);

        scroll.addView(root);
        return scroll;
    }

    private int dpToPx(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }
}
