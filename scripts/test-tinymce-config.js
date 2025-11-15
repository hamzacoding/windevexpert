// Simple test to fetch TinyMCE script src from local API
(async () => {
  try {
    const res = await fetch('http://localhost:3005/api/tinymce-config');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('✅ /api/tinymce-config response:', data);
  } catch (e) {
    console.error('❌ Failed to fetch /api/tinymce-config:', e.message);
    process.exit(1);
  }
})();