package com.sportster.app.ui.gym;

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
import com.sportster.app.databinding.ActivityGymSlotPickerBinding;

import java.util.Arrays;
import java.util.List;

public class GymSlotPickerActivity extends AppCompatActivity {

    private ActivityGymSlotPickerBinding binding;
    private TextView selectedSlotView = null;
    private String selectedSlot = null;
    private int duration = 1;

    private final List<String> slots = Arrays.asList(
        "5:00 AM","6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM",
        "11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM",
        "5:00 PM","6:00 PM","7:00 PM","8:00 PM"
    );
    private final List<String> busy = Arrays.asList("7:00 AM","8:00 AM","5:00 PM","6:00 PM");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityGymSlotPickerBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String gymName  = getIntent().getStringExtra("gym_name");
        String gymPrice = getIntent().getStringExtra("gym_price");
        if (gymName  != null) binding.tvGymName.setText(gymName);

        binding.btnBack.setOnClickListener(v -> finish());

        binding.btnDurMinus.setOnClickListener(v -> {
            if (duration > 1) { duration--; updateDuration(); }
        });
        binding.btnDurPlus.setOnClickListener(v -> {
            if (duration < 6) { duration++; updateDuration(); }
        });

        buildSlotGrid();

        binding.btnConfirm.setOnClickListener(v -> {
            if (selectedSlot == null) {
                Snackbar.make(binding.getRoot(), "Please select a time slot", Snackbar.LENGTH_SHORT).show();
                return;
            }
            Intent intent = new Intent(this, GymBookingConfirmedActivity.class);
            intent.putExtra("gym_name",  gymName);
            intent.putExtra("slot",      selectedSlot);
            intent.putExtra("duration",  duration);
            intent.putExtra("price",     gymPrice);
            startActivity(intent);
        });
    }

    private void updateDuration() {
        binding.tvDuration.setText(duration + " hr" + (duration > 1 ? "s" : ""));
    }

    private void buildSlotGrid() {
        int dp = Math.round(getResources().getDisplayMetrics().density);
        for (String slot : slots) {
            TextView tv = new TextView(this);
            tv.setText(slot);
            tv.setTextSize(12f);
            tv.setGravity(Gravity.CENTER);
            tv.setPadding(dp * 4, dp * 10, dp * 4, dp * 10);

            GridLayout.LayoutParams lp = new GridLayout.LayoutParams();
            lp.width  = 0;
            lp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1, 1f);
            lp.setMargins(dp * 3, dp * 3, dp * 3, dp * 3);
            tv.setLayoutParams(lp);

            boolean isBusy = busy.contains(slot);
            if (isBusy) {
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
    }
}
