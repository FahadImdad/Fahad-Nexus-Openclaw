package com.sportster.app.ui.arenas;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.sportster.app.databinding.ActivityBookingConfirmedBinding;
import com.sportster.app.ui.home.MainActivity;

public class BookingConfirmedActivity extends AppCompatActivity {

    private ActivityBookingConfirmedBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityBookingConfirmedBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String arenaName = getIntent().getStringExtra("arena_name");
        String slot      = getIntent().getStringExtra("slot");
        String price     = getIntent().getStringExtra("price");

        if (arenaName != null) binding.tvArenaName.setText(arenaName);
        if (slot      != null) binding.tvSlot.setText("Time: " + slot);
        if (price     != null) binding.tvTotal.setText("Total: " + price);

        // Booking ID
        binding.tvBookingId.setText("Booking #SP" + (int)(Math.random() * 90000 + 10000));

        binding.btnGoHome.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
        });
    }
}
