package com.sportster.app.ui.events;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.sportster.app.databinding.ActivityTournamentDetailBinding;

public class TournamentDetailActivity extends AppCompatActivity {

    private ActivityTournamentDetailBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityTournamentDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String name   = getIntent().getStringExtra("t_name");
        String sport  = getIntent().getStringExtra("t_sport");
        String date   = getIntent().getStringExtra("t_date");
        String fee    = getIntent().getStringExtra("t_fee");
        String status = getIntent().getStringExtra("t_status");

        if (name  != null) binding.tvTName.setText(name);
        if (sport != null) binding.tvTSport.setText(sport);
        if (date  != null) binding.tvTDate.setText("📅 " + date);
        if (fee   != null) binding.tvTFee.setText("Entry: " + fee);

        boolean isOpen = "Open".equals(status);
        binding.btnJoin.setEnabled(isOpen);
        binding.btnJoin.setText(isOpen ? "Join Tournament" : "Registration Closed");

        binding.btnBack.setOnClickListener(v -> finish());

        binding.btnJoin.setOnClickListener(v -> {
            setLoading(true);
            binding.getRoot().postDelayed(() -> {
                setLoading(false);
                Snackbar.make(binding.getRoot(),
                    "Registered for " + name + "! 🏆", Snackbar.LENGTH_LONG).show();
            }, 1200);
        });
    }

    private void setLoading(boolean loading) {
        binding.btnJoin.setEnabled(!loading);
        binding.btnJoin.setText(loading ? "Registering…" : "Join Tournament");
    }
}
