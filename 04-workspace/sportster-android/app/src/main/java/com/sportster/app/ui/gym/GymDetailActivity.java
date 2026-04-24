package com.sportster.app.ui.gym;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.sportster.app.databinding.ActivityGymDetailBinding;

public class GymDetailActivity extends AppCompatActivity {

    private ActivityGymDetailBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityGymDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String gymName  = getIntent().getStringExtra("gym_name");
        String sport    = getIntent().getStringExtra("gym_sport");
        String price    = getIntent().getStringExtra("gym_price");
        String machines = getIntent().getStringExtra("gym_machines");

        if (gymName  != null) binding.tvGymName.setText(gymName);
        if (sport    != null) binding.tvGymSport.setText(sport);
        if (price    != null) binding.tvGymPrice.setText(price);
        if (machines != null) binding.tvMachineCount.setText(machines);

        binding.btnBack.setOnClickListener(v -> finish());

        binding.btnViewMachines.setOnClickListener(v ->
            startActivity(new Intent(this, GymMachinesActivity.class)
                .putExtra("gym_name", gymName)));

        binding.btnBookGym.setOnClickListener(v -> {
            Intent intent = new Intent(this, GymSlotPickerActivity.class);
            intent.putExtra("gym_name",  gymName);
            intent.putExtra("gym_price", price);
            startActivity(intent);
        });

        setupMuscleAccordion();
    }

    private void setupMuscleAccordion() {
        setupSection(binding.sectionChest,  binding.contentChest);
        setupSection(binding.sectionBack,   binding.contentBack);
        setupSection(binding.sectionShoul,  binding.contentShoul);
        setupSection(binding.sectionBiceps, binding.contentBiceps);
        setupSection(binding.sectionTri,    binding.contentTri);
        setupSection(binding.sectionLegs,   binding.contentLegs);
    }

    private void setupSection(LinearLayout header, LinearLayout content) {
        content.setVisibility(View.GONE);
        header.setOnClickListener(v -> {
            content.setVisibility(
                content.getVisibility() == View.GONE ? View.VISIBLE : View.GONE);
        });
    }
}
