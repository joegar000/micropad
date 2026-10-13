# Media

Seven independent widgets for system volume, mute, play/pause, next, previous,
volume up, and volume down. All media state lives in the plugin's runtime state.

Playback uses `node-nowplaying` (macOS MediaRemote, Windows GSMTC, Linux MPRIS).
Commands target the current player; a player that starts playing becomes current.
System volume and mute use `pulseaudio.js` on Linux, with `loudness` as the
cross-platform fallback.

The `nowplaying-*` optional dependency aliases work around a packaging error in
`node-nowplaying@0.1.0`: its loader requests those names, but its native packages
are published as `node-nowplaying-*`.
