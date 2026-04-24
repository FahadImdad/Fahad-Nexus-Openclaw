package com.sportster.app.ui.profile;

import android.os.Bundle;
import android.text.TextUtils;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.sportster.app.databinding.ActivityEditProfileBinding;

public class EditProfileActivity extends AppCompatActivity {

    private ActivityEditProfileBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityEditProfileBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBack.setOnClickListener(v -> finish());

        binding.btnSave.setOnClickListener(v -> {
            String name = binding.etName.getText().toString().trim();
            if (TextUtils.isEmpty(name)) {
                binding.tilName.setError("Name is required");
                return;
            }
            binding.tilName.setError(null);
            setLoading(true);
            binding.getRoot().postDelayed(() -> {
                setLoading(false);
                Snackbar.make(binding.getRoot(), "Profile updated!", Snackbar.LENGTH_SHORT).show();
                finish();
            }, 1000);
        });
    }

    private void setLoading(boolean loading) {
        binding.btnSave.setEnabled(!loading);
        binding.btnSave.setText(loading ? "Saving…" : "Save Changes");
    }
}
