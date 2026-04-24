package com.sportster.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.sportster.app.databinding.ActivityRegisterBinding;

public class RegisterActivity extends AppCompatActivity {

    private ActivityRegisterBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityRegisterBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBack.setOnClickListener(v -> finish());

        binding.tvLogin.setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        binding.btnRegister.setOnClickListener(v -> attemptRegister());
    }

    private void attemptRegister() {
        String name     = binding.etName.getText().toString().trim();
        String phone    = binding.etPhone.getText().toString().trim();
        String email    = binding.etEmail.getText().toString().trim();
        String password = binding.etPassword.getText().toString().trim();
        String confirm  = binding.etConfirmPassword.getText().toString().trim();

        // Clear previous errors
        binding.tilName.setError(null);
        binding.tilPhone.setError(null);
        binding.tilEmail.setError(null);
        binding.tilPassword.setError(null);
        binding.tilConfirmPassword.setError(null);

        if (TextUtils.isEmpty(name)) {
            binding.tilName.setError("Full name is required");
            return;
        }
        if (TextUtils.isEmpty(phone) || phone.length() < 10) {
            binding.tilPhone.setError("Enter a valid phone number");
            return;
        }
        if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.setError("Enter a valid email");
            return;
        }
        if (password.length() < 6) {
            binding.tilPassword.setError("Password must be at least 6 characters");
            return;
        }
        if (!password.equals(confirm)) {
            binding.tilConfirmPassword.setError("Passwords do not match");
            return;
        }
        if (!binding.cbTerms.isChecked()) {
            Snackbar.make(binding.getRoot(), "Please accept the Terms of Service", Snackbar.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);

        // TODO: Replace with real API call
        binding.getRoot().postDelayed(() -> {
            setLoading(false);
            Intent intent = new Intent(this, OtpActivity.class);
            intent.putExtra(OtpActivity.EXTRA_PHONE, "+92 " + phone);
            startActivity(intent);
        }, 1500);
    }

    private void setLoading(boolean loading) {
        binding.btnRegister.setEnabled(!loading);
        binding.btnRegister.setText(loading ? "Creating account…" : "Create Account");
    }
}
