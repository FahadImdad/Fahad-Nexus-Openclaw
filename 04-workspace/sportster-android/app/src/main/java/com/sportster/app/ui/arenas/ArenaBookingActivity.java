package com.sportster.app.ui.arenas;

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

import com.sportster.app.databinding.ActivityArenaBookingBinding;

import java.util.Arrays;
import java.util.List;

public class ArenaBookingActivity extends AppCompatActivity {

    private ActivityArenaBookingBinding binding;

    private final List<Arena> arenas = Arrays.asList(
        new Arena("⚽", "DHA Sports Arena", "DHA Phase 6 · Football, Cricket", "★ 4.8", "Rs 2,000/hr"),
        new Arena("🏀", "Clifton Basketball Court", "Clifton · Basketball", "★ 4.6", "Rs 1,500/hr"),
        new Arena("🎾", "Karachi Tennis Club", "Gulshan · Tennis, Badminton", "★ 4.9", "Rs 1,800/hr"),
        new Arena("🏏", "Naya Nazimabad Cricket Ground", "Naya Nazimabad · Cricket", "★ 4.5", "Rs 2,500/hr"),
        new Arena("⚽", "Gulistan-e-Johar Turf", "Gulistan-e-Johar · Football", "★ 4.7", "Rs 1,800/hr"),
        new Arena("🏐", "Johar Volleyball Court", "Block 7 · Volleyball", "★ 4.3", "Rs 1,200/hr")
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityArenaBookingBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBack.setOnClickListener(v -> finish());

        binding.rvArenas.setLayoutManager(new LinearLayoutManager(this));
        binding.rvArenas.setAdapter(new ArenaAdapter(arenas, arena -> {
            Intent intent = new Intent(this, ArenaDetailActivity.class);
            intent.putExtra("arena_name", arena.name);
            intent.putExtra("arena_sport", arena.sports);
            intent.putExtra("arena_price", arena.price);
            startActivity(intent);
        }));
    }

    static class Arena {
        final String emoji, name, sports, rating, price;
        Arena(String emoji, String name, String sports, String rating, String price) {
            this.emoji = emoji; this.name = name; this.sports = sports;
            this.rating = rating; this.price = price;
        }
    }

    interface OnArenaClick { void onClick(Arena arena); }

    static class ArenaAdapter extends RecyclerView.Adapter<ArenaAdapter.VH> {
        private final List<Arena> items;
        private final OnArenaClick listener;
        ArenaAdapter(List<Arena> items, OnArenaClick listener) {
            this.items = items; this.listener = listener;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                .inflate(com.sportster.app.R.layout.item_arena_card, parent, false);
            return new VH(v);
        }

        @Override
        public void onBindViewHolder(@NonNull VH h, int pos) {
            Arena a = items.get(pos);
            h.tvEmoji.setText(a.emoji);
            h.tvName.setText(a.name);
            h.tvSports.setText(a.sports);
            h.tvRating.setText(a.rating);
            h.tvPrice.setText(a.price);
            h.itemView.setOnClickListener(v -> listener.onClick(a));
        }

        @Override public int getItemCount() { return items.size(); }

        static class VH extends RecyclerView.ViewHolder {
            TextView tvEmoji, tvName, tvSports, tvRating, tvPrice;
            VH(View v) {
                super(v);
                tvEmoji  = v.findViewById(com.sportster.app.R.id.tvArenaEmoji);
                tvName   = v.findViewById(com.sportster.app.R.id.tvArenaName);
                tvSports = v.findViewById(com.sportster.app.R.id.tvArenaSports);
                tvRating = v.findViewById(com.sportster.app.R.id.tvArenaRating);
                tvPrice  = v.findViewById(com.sportster.app.R.id.tvArenaPrice);
            }
        }
    }
}
