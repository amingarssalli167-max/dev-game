// seed_b.js — concatenated BETWEEN the harness and the game source in the
// "reopen" test. It seeds the stubbed localStorage from the file the
// "closed" game process left behind, so the game parses + auto-boots
// exactly like a real browser reopening with a persisted store.
try{
  const fs0=require('fs');
  const st0=JSON.parse(fs0.readFileSync('/tmp/ch_reopen_store.json','utf8'));
  for(const k in st0)__store[k]=st0[k];
}catch(e){ /* the B-suite asserts on the result */ }
