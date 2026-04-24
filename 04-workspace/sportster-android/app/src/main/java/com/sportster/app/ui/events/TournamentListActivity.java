package com.sportster.app.ui.events;

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
import com.sportster.app.databinding.ActivityTournamentListBinding;

import java.util.Arrays;
import java.util.List;

public class TournamentListActivity extends AppCompatActivity {

    private ActivityTournamentListBinding binding;

    private final List<Tournament> tournaments = Arrays.asList(
        new Tournament("⚽", "Karachi Football Cup", "Football · 16 Teams", "May 3 – May 10", "Rs 500/team", "Open"),
        new Tournament("🏀", "Clifton 3x3 Showdown", "Basketball · 8 Teams", "May 6", "Rs 300/team", "Open"),
        new Tournament("🏏", "DHA T20 Cricket Bash", "Cricket · 12 Teams", "May 8 – May 12", "Rs 1,000/team", "Open"),
        new Tournament("🎾", "Sunday Smash Tennis", "Tennis · Singles", "May 5", "Rs 200/player", "Open"),
        new Tournament("⚽", "Gulshan Street League", "Football · 8 Teams", "May 15 – May 22", "Free", "Closed")
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityTournamentListBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnBack.setOnClickListener(v -> finish());

        binding.rvTournaments.setLayoutManager(new LinearLayoutManager(this));
        binding.rvTournaments.setAdapter(new TournamentAdapter(tournaments, t -> {
            Intent intent = new Intent(this, TournamentDetailActivity.class);
            intent.putExtra("t_name",   t.name);
            intent.putExtra("t_sport",  t.sport);
            intent.putExtra("t_date",   t.date);
            intent.putExtra("t_fee",    t.fee);
            intent.putExtra("t_status", t.status);
            startActivity(intent);
        }));
    }

    static class Tournament {
        final String emoji, name, sport, date, fee, status;
        Tournament(String emoji, String name, String sport, String date, String fee, String status) {
            this.emoji = emoji; this.name = name; this.sport = sport;
            this.date = date; this.fee = fee; this.status = status;
        }
    }

    interface OnTClick { void onClick(Tournament t); }

    static class TournamentAdapter extends RecyclerView.Adapter<TournamentAdapter.VH> {
        private final List<Tournament> items;
        private final OnTClick listener;
        TournamentAdapter(List<Tournament> items, OnTClick listener) {
            this.items = items; this.listener = listener;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_tournament_card, parent, false);
            return new VH(v);
        }

        @Override
        public void onBindViewHolder(@NonNull VH h, int pos) {
            Tournament t = items.get(pos);
            h.tvEmoji.setText(t.emoji);
            h.tvName.setText(t.name);
            h.tvSport.setText(t.sport);
            h.tvDate.setText("📅 " + t.date);
            h.tvFee.setText(t.fee);
            h.tvStatus.setText(t.status);
            boolean open = "Open".equals(t.status);
            h.tvStatus.setBackgroundResource(open
                ? R.drawable.bg_pill_green_light
                : R.drawable.bg_slot_booked);
            h.tvStatus.setTextColor(h.itemView.getContext().getColor(
                open ? R.color.green : R.color.red));
            h.itemView.setOnClickListener(v -> listener.onClick(t));
        }

        @Override public int getItemCount() { return items.size(); }

        static class VH extends RecyclerView.ViewHolder {
            TextView tvEmoji, tvName, tvSport, tvDate, tvFee, tvStatus;
            VH(View v) {
                super(v);
                tvEmoji  = v.findViewById(R.id.tvTEmoji);
                tvName   = v.findViewById(R.id.tvTName);
                tvSport  = v.findViewById(R.id.tvTSport);
                tvDate   = v.findViewById(R.id.tvTDate);
                tvFee    = v.findViewById(R.id.tvTFee);
                tvStatus = v.findViewById(R.id.tvTStatus);
            }
        }
    }
}
