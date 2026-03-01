document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('csv-upload');
    const filenameText = document.getElementById('filename-text');
    const btnSubmit = document.getElementById('btn-submit');

    // Listen for file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            filenameText.textContent = fileName;
        } else {
            filenameText.textContent = '';
        }
    });

    // Handle submit
    btnSubmit.addEventListener('click', (e) => {
        e.preventDefault();

        if (fileInput.files && fileInput.files.length > 0) {
            // Store filename in sessionStorage if one exists
            const fileName = fileInput.files[0].name;
            sessionStorage.setItem('uploadedFile', fileName);
        }

        // Always redirect
        window.location.href = 'dashboard.html';
    });
});
