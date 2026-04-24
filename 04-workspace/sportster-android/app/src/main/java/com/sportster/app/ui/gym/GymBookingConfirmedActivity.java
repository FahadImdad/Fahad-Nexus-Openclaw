package com.sportster.app.ui.gym;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.sportster.app.databinding.ActivityGymBookingConfirmedBinding;
import com.sportster.app.ui.home.MainActivity;

public class GymBookingConfirmedActivity extends AppCompatActivity {

    private ActivityGymBookingConfirmedBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityGymBookingConfirmedBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String gymName  = getIntent().getStringExtra("gym_name");
        String slot     = getIntent().getStringExtra("slot");
        int    duration = getIntent().getIntExtra("duration", 1);
        String price    = getIntent().getStringExtra("price");

        if (gymName != null) binding.tvGymName.setText(gymName);
        if (slot    != null) binding.tvSlot.setText("Time: " + slot + " · " + duration + " hr" + (duration > 1 ? "s" : ""));
        if (price   != null) binding.tvPrice.setText(price);

        binding.tvBookingId.setText("Gym Pass #GP" + (int)(Math.random() * 90000 + 10000));

        binding.btnGoHome.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
        });
    }
}
