package com.couturepro.app;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Edge-to-edge + polyfill safe-area (@capacitor-community/safe-area) :
        // affichage correct sous la status bar / barre de navigation, y compris Android récents.
        EdgeToEdge.enable(this);
    }
}
