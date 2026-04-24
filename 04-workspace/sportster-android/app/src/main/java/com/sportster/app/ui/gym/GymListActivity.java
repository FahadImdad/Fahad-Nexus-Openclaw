package com.sportster.app.ui.gym;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.sportster.app.R;
import com.sportster.app.databinding.ActivityGymListBinding;

import java.util.Arrays;
import java.util.List;

public class GymListActivity extends AppCompatActivity {

    private ActivityGymListBinding binding;

    private final List<Gym> gyms = Arrays.asList(
        new Gym("🏋️", "IronCore Fitness", "DHA Phase 5 · All Equipment", "★ 4.9", "Rs 500/hr", "32 machines"),
        new Gym("⚡", "Apex Performance", "Clifton · Cardio + Weights", "★ 4.7", "Rs 600/hr", "28 machines"),
        new Gym("💪", "PowerZone Gym", "Gulshan-e-Iqbal · Bodybuilding", "★ 4.6", "Rs 450/hr", "25 machines"),
        new Gym("🥊", "Elite Combat Sports", "Nazimabad · Combat + Fitness", "★ 4.8", "Rs 550/hr", "20 machines")
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityGymListBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBack.setOnClickListener(v -> finish());

        binding.rvGyms.setLayoutManager(new LinearLayoutManager(this));
        binding.rvGyms.setAdapter(new GymAdapter(gyms, gym -> {
            Intent intent = new Intent(this, GymDetailActivity.class);
            intent.putExtra("gym_name",     gym.name);
            intent.putExtra("gym_sport",    gym.sports);
            intent.putExtra("gym_price",    gym.price);
            intent.putExtra("gym_machines", gym.machines);
            startActivity(intent);
        }));
    }

    static class Gym {
        final String emoji, name, sports, rating, price, machines;
        Gym(String emoji, String name, String sports, String rating, String price, String machines) {
            this.emoji = emoji; this.name = name; this.sports = sports;
            this.rating = rating; this.price = price; this.machines = machines;
        }
    }

    interface OnGymClick { void onClick(Gym gym); }

    static class GymAdapter extends RecyclerView.Adapter<GymAdapter.VH> {
        private final List<Gym> items;
        private final OnGymClick listener;
        GymAdapter(List<Gym> items, OnGymClick listener) {
            this.items = items; this.listener = listener;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_gym_card, parent, false);
            return new VH(v);
        }

        @Override
        public void onBindViewHolder(@NonNull VH h, int pos) {
            Gym g = items.get(pos);
            h.tvEmoji.setText(g.emoji);
            h.tvName.setText(g.name);
            h.tvSports.setText(g.sports);
            h.tvRating.setText(g.rating);
            h.tvPrice.setText(g.price);
            h.tvMachines.setText(g.machines);
            h.itemView.setOnClickListener(v -> listener.onClick(g));
        }

        @Override public int getItemCount() { return items.size(); }

        static class VH extends RecyclerView.ViewHolder {
            TextView tvEmoji, tvName, tvSports, tvRating, tvPrice, tvMachines;
            VH(View v) {
                super(v);
                tvEmoji    = v.findViewById(R.id.tvGymEmoji);
                tvName     = v.findViewById(R.id.tvGymName);
                tvSports   = v.findViewById(R.id.tvGymSports);
                tvRating   = v.findViewById(R.id.tvGymRating);
                tvPrice    = v.findViewById(R.id.tvGymPrice);
                tvMachines = v.findViewById(R.id.tvGymMachines);
            }
        }
    }
}
