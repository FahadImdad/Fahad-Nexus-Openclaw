package com.sportster.app.ui.auth;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;

import com.sportster.app.R;
import com.sportster.app.databinding.ActivityOnboardingBinding;
import com.tbuonomo.viewpagerdotsindicator.DotsIndicator;

import java.util.Arrays;
import java.util.List;

public class OnboardingActivity extends AppCompatActivity {

    private ActivityOnboardingBinding binding;

    private final List<OnboardSlide> slides = Arrays.asList(
        new OnboardSlide("🏟️", "Book Arenas & Gyms",
            "Browse and book sports arenas, courts and gyms near you — by the hour, any time."),
        new OnboardSlide("🤝", "Find Players & Teams",
            "Discover players around you, form teams, accept challenges and never play alone again."),
        new OnboardSlide("🏆", "Join Tournaments",
            "Compete in local tournaments, track your wins and climb the Karachi leaderboard.")
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOnboardingBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        OnboardingAdapter adapter = new OnboardingAdapter(slides);
        binding.viewPager.setAdapter(adapter);
        binding.dotsIndicator.attachTo(binding.viewPager);

        binding.viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                binding.btnNext.setText(
                    position == slides.size() - 1 ? getString(R.string.get_started) : getString(R.string.next)
                );
            }
        });

        binding.btnNext.setOnClickListener(v -> {
            int current = binding.viewPager.getCurrentItem();
            if (current < slides.size() - 1) {
                binding.viewPager.setCurrentItem(current + 1);
            } else {
                finishOnboarding();
            }
        });

        binding.tvSkip.setOnClickListener(v -> finishOnboarding());
    }

    private void finishOnboarding() {
        getSharedPreferences("sportster_prefs", MODE_PRIVATE)
            .edit()
            .putBoolean("onboarding_done", true)
            .apply();
        startActivity(new Intent(this, LoginActivity.class));
        finish();
    }

    // ── Slide model ──────────────────────────────────────────
    static class OnboardSlide {
        final String emoji, title, description;
        OnboardSlide(String emoji, String title, String description) {
            this.emoji = emoji; this.title = title; this.description = description;
        }
    }

    // ── Adapter ──────────────────────────────────────────────
    static class OnboardingAdapter extends RecyclerView.Adapter<OnboardingAdapter.VH> {
        private final List<OnboardSlide> slides;
        OnboardingAdapter(List<OnboardSlide> slides) { this.slides = slides; }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_onboarding_slide, parent, false);
            return new VH(view);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            OnboardSlide slide = slides.get(position);
            holder.tvEmoji.setText(slide.emoji);
            holder.tvTitle.setText(slide.title);
            holder.tvDescription.setText(slide.description);
        }

        @Override
        public int getItemCount() { return slides.size(); }

        static class VH extends RecyclerView.ViewHolder {
            TextView tvEmoji, tvTitle, tvDescription;
            VH(View v) {
                super(v);
                tvEmoji       = v.findViewById(R.id.tvEmoji);
                tvTitle       = v.findViewById(R.id.tvTitle);
                tvDescription = v.findViewById(R.id.tvDescription);
            }
        }
    }
}
