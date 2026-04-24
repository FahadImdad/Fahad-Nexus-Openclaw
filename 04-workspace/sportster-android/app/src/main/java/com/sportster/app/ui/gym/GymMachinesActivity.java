package com.sportster.app.ui.gym;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.sportster.app.databinding.ActivityGymMachinesBinding;

public class GymMachinesActivity extends AppCompatActivity {

    private ActivityGymMachinesBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityGymMachinesBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String gymName = getIntent().getStringExtra("gym_name");
        if (gymName != null) binding.tvGymName.setText(gymName);

        binding.btnBack.setOnClickListener(v -> finish());
    }
}
