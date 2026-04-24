package com.sportster.app.ui.arenas;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.sportster.app.databinding.ActivityArenaDetailBinding;

public class ArenaDetailActivity extends AppCompatActivity {

    private ActivityArenaDetailBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityArenaDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String name  = getIntent().getStringExtra("arena_name");
        String sport = getIntent().getStringExtra("arena_sport");
        String price = getIntent().getStringExtra("arena_price");

        if (name  != null) binding.tvArenaName.setText(name);
        if (sport != null) binding.tvArenaSport.setText(sport);
        if (price != null) binding.tvArenaPrice.setText(price);

        binding.btnBack.setOnClickListener(v -> finish());

        binding.btnBookNow.setOnClickListener(v -> {
            Intent intent = new Intent(this, ArenaSlotPickerActivity.class);
            intent.putExtra("arena_name", name);
            intent.putExtra("arena_price", price);
            startActivity(intent);
        });
    }
}
