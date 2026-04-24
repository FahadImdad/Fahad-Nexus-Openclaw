package com.sportster.app.ui.auth;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.sportster.app.databinding.ActivityLoginBinding;
import com.sportster.app.ui.home.MainActivity;

public class LoginActivity extends AppCompatActivity {

    private ActivityLoginBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnLogin.setOnClickListener(v -> attemptLogin());

        binding.tvForgotPassword.setOnClickListener(v ->
            startActivity(new Intent(this, ForgotPasswordActivity.class))
        );

        binding.tvRegister.setOnClickListener(v ->
            startActivity(new Intent(this, RegisterActivity.class))
        );

        binding.btnGoogle.setOnClickListener(v ->
            Snackbar.make(binding.getRoot(), "Google Sign-In coming soon", Snackbar.LENGTH_SHORT).show()
        );
    }

    private void attemptLogin() {
        String email    = binding.etEmail.getText().toString().trim();
        String password = binding.etPassword.getText().toString().trim();

        binding.tilEmail.setError(null);
        binding.tilPassword.setError(null);

        if (TextUtils.isEmpty(email)) {
            binding.tilEmail.setError("Email is required");
            return;
        }
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.setError("Enter a valid email");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            binding.tilPassword.setError("Password is required");
            return;
        }
        if (password.length() < 6) {
            binding.tilPassword.setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        // TODO: Replace with real API call
        binding.getRoot().postDelayed(() -> {
            setLoading(false);
            // Simulate success → go to OTP verification
            Intent intent = new Intent(this, OtpActivity.class);
            intent.putExtra(OtpActivity.EXTRA_PHONE, "+92 300 xxxxxxx");
            startActivity(intent);
        }, 1500);
    }

    private void setLoading(boolean loading) {
        binding.btnLogin.setEnabled(!loading);
        binding.btnLogin.setText(loading ? "Logging in…" : "Log In");
    }
}
