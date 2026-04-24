package com.sportster.app.ui.arenas;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.GridLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.google.android.material.snackbar.Snackbar;
import com.sportster.app.R;
import com.sportster.app.databinding.ActivityArenaSlotPickerBinding;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ArenaSlotPickerActivity extends AppCompatActivity {

    private ActivityArenaSlotPickerBinding binding;
    private TextView selectedSlotView = null;
    private String selectedSlot = null;

    private final List<String> slots = Arrays.asList(
        "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
        "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
        "6:00 PM","7:00 PM","8:00 PM","9:00 PM"
    );
    private final List<String> booked = Arrays.asList("9:00 AM","10:00 AM","3:00 PM");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityArenaSlotPickerBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String arenaName  = getIntent().getStringExtra("arena_name");
        String arenaPrice = getIntent().getStringExtra("arena_price");
        if (arenaName  != null) binding.tvArenaName.setText(arenaName);
        if (arenaPrice != null) binding.tvPrice.setText(arenaPrice);

        binding.btnBack.setOnClickListener(v -> finish());
        buildSlotGrid();

        binding.btnConfirm.setOnClickListener(v -> {
            if (selectedSlot == null) {
                Snackbar.make(binding.getRoot(), "Please select a time slot", Snackbar.LENGTH_SHORT).show();
                return;
            }
            Intent intent = new Intent(this, BookingConfirmedActivity.class);
            intent.putExtra("arena_name", arenaName);
            intent.putExtra("slot", selectedSlot);
            intent.putExtra("price", arenaPrice);
            startActivity(intent);
        });
    }

    private void buildSlotGrid() {
        int dpUnit = Math.round(getResources().getDisplayMetrics().density);
        for (String slot : slots) {
            TextView tv = new TextView(this);
            tv.setText(slot);
            tv.setTextSize(13f);
            tv.setGravity(Gravity.CENTER);
            tv.setPadding(dpUnit * 4, dpUnit * 10, dpUnit * 4, dpUnit * 10);

            GridLayout.LayoutParams lp = new GridLayout.LayoutParams();
            lp.width  = 0;
            lp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1, 1f);
            lp.setMargins(dpUnit * 4, dpUnit * 4, dpUnit * 4, dpUnit * 4);
            tv.setLayoutParams(lp);

            boolean isBooked = booked.contains(slot);
            if (isBooked) {
                tv.setBackgroundResource(R.drawable.bg_slot_booked);
                tv.setTextColor(ContextCompat.getColor(this, R.color.text3));
                tv.setEnabled(false);
            } else {
                tv.setBackgroundResource(R.drawable.bg_slot_available);
                tv.setTextColor(ContextCompat.getColor(this, R.color.text));
                tv.setOnClickListener(view -> selectSlot(tv, slot));
            }
            binding.gridSlots.addView(tv);
        }
    }

    private void selectSlot(TextView tv, String slot) {
        if (selectedSlotView != null) {
            selectedSlotView.setBackgroundResource(R.drawable.bg_slot_available);
            selectedSlotView.setTextColor(ContextCompat.getColor(this, R.color.text));
        }
        selectedSlotView = tv;
        selectedSlot = slot;
        tv.setBackgroundResource(R.drawable.bg_slot_selected);
        tv.setTextColor(Color.WHITE);
        binding.tvSelectedSlot.setText("Selected: " + slot);
        binding.tvSelectedSlot.setVisibility(View.VISIBLE);
    }
}
