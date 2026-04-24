package com.sportster.app.ui.auth;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import com.goodiebag.pinview.Pinview;
import com.google.android.material.snackbar.Snackbar;
import com.sportster.app.databinding.ActivityOtpBinding;
import com.sportster.app.ui.home.MainActivity;

import java.util.Locale;

public class OtpActivity extends AppCompatActivity {

    public static final String EXTRA_PHONE = "extra_phone";
    private static final long TIMER_MS = 60_000L;

    private ActivityOtpBinding binding;
    private CountDownTimer countDownTimer;
    private boolean canResend = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOtpBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String phone = getIntent().getStringExtra(EXTRA_PHONE);
        if (phone != null) {
            binding.tvSentTo.setText("We sent a 6-digit code to\n" + phone);
        }

        binding.btnBack.setOnClickListener(v -> finish());

        binding.btnVerify.setOnClickListener(v -> verifyOtp());

        binding.tvResend.setOnClickListener(v -> {
            if (canResend) {
                resendCode();
            }
        });

        startTimer();
    }

    private void verifyOtp() {
        String code = binding.pinView.getValue();
        if (code.length() < 6) {
            Snackbar.make(binding.getRoot(), "Enter the complete 6-digit code", Snackbar.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);

        // TODO: Replace with real API verification
        binding.getRoot().postDelayed(() -> {
            setLoading(false);
            // Save login state
            getSharedPreferences("sportster_prefs", MODE_PRIVATE)
                .edit()
                .putBoolean("logged_in", true)
                .apply();
            // Navigate to main
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        }, 1200);
    }

    private void resendCode() {
        canResend = false;
        binding.tvResend.setAlpha(0.5f);
        startTimer();
        Snackbar.make(binding.getRoot(), "Code resent!", Snackbar.LENGTH_SHORT).show();
        // TODO: API call to resend OTP
    }

    private void startTimer() {
        if (countDownTimer != null) countDownTimer.cancel();
        countDownTimer = new CountDownTimer(TIMER_MS, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                long secs = millisUntilFinished / 1000;
                binding.tvTimer.setText(String.format(Locale.getDefault(), "Resend in 00:%02d", secs));
                binding.tvTimer.setVisibility(View.VISIBLE);
            }

            @Override
            public void onFinish() {
                binding.tvTimer.setVisibility(View.GONE);
                canResend = true;
                binding.tvResend.setAlpha(1f);
                binding.tvResend.setText("Didn't receive it?  Resend Code");
            }
        }.start();
    }

    private void setLoading(boolean loading) {
        binding.btnVerify.setEnabled(!loading);
        binding.btnVerify.setText(loading ? "Verifying…" : "Verify");
        binding.pinView.setEnabled(!loading);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (countDownTimer != null) countDownTimer.cancel();
    }
}
