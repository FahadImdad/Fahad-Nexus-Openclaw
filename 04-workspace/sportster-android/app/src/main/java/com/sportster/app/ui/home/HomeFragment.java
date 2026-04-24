package com.sportster.app.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.sportster.app.databinding.FragmentHomeBinding;
import com.sportster.app.ui.arenas.ArenaBookingActivity;
import com.sportster.app.ui.events.TournamentListActivity;
import com.sportster.app.ui.gym.GymListActivity;

public class HomeFragment extends Fragment {

    private FragmentHomeBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.cardBookArena.setOnClickListener(v ->
            startActivity(new Intent(requireContext(), ArenaBookingActivity.class)));

        binding.cardBookGym.setOnClickListener(v ->
            startActivity(new Intent(requireContext(), GymListActivity.class)));

        binding.cardTournaments.setOnClickListener(v ->
            startActivity(new Intent(requireContext(), TournamentListActivity.class)));
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
