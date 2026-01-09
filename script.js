document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const fileCount = document.getElementById('fileCount');
    const previewContainer = document.getElementById('previewContainer');
    const renameBtn = document.getElementById('renameBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('status');
    const viewerImage = document.getElementById('viewerImage');
    const viewerPlaceholder = document.getElementById('viewerPlaceholder');
    const prefixInput = document.getElementById('prefixInput');

    let uploadedFiles = [];
    let renamedFiles = [];

    new Sortable(previewContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost'
    });

    fileInput.addEventListener('change', function (e) {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        uploadedFiles = files;
        renamedFiles = [];
        fileCount.textContent = `${files.length} file(s) selected`;

        previewContainer.innerHTML = '';
        viewerImage.style.display = 'none';
        viewerPlaceholder.style.display = 'block';

        files.forEach((file, index) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.dataset.originalIndex = index;

                const img = document.createElement('img');
                img.className = 'preview-img';
                img.src = e.target.result;
                img.alt = file.name;

                const nameDiv = document.createElement('div');
                nameDiv.className = 'preview-name';
                nameDiv.textContent = file.name;

                previewItem.appendChild(img);
                previewItem.appendChild(nameDiv);

                previewItem.addEventListener('click', function () {
                    viewerImage.src = e.target.result;
                    viewerImage.style.display = 'block';
                    viewerPlaceholder.style.display = 'none';
                });

                previewContainer.appendChild(previewItem);
            };

            reader.readAsDataURL(file);
        });

        renameBtn.disabled = false;
        downloadBtn.disabled = true;
        updateStatus('Files uploaded successfully. You can drag and drop to reorder, then click "Rename".', 'success');
    });

    renameBtn.addEventListener('click', function () {
        if (uploadedFiles.length === 0) {
            updateStatus('No files to rename. Please upload images first.', 'error');
            return;
        }

        renamedFiles = [];
        const previewItems = Array.from(previewContainer.children);

        if (previewItems.length === 0 && uploadedFiles.length > 0) {
            return;
        }

        const prefix = prefixInput.value.trim();
        previewContainer.innerHTML = '';

        previewItems.forEach((item, index) => {
            const originalIndex = parseInt(item.dataset.originalIndex);
            const file = uploadedFiles[originalIndex];

            const extension = file.name.split('.').pop();
            const newName = `${prefix}${index + 1}.${extension}`;

            const renamedFile = new File([file], newName, { type: file.type });
            renamedFiles.push(renamedFile);

            const reader = new FileReader();

            reader.onload = function (e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.dataset.originalIndex = originalIndex;
                previewItem.dataset.currentIndex = index;

                const img = document.createElement('img');
                img.className = 'preview-img';
                img.src = e.target.result;
                img.alt = newName;

                const nameDiv = document.createElement('div');
                nameDiv.className = 'preview-name';
                nameDiv.textContent = newName;

                previewItem.appendChild(img);
                previewItem.appendChild(nameDiv);

                previewItem.addEventListener('click', function () {
                    viewerImage.src = e.target.result;
                    viewerImage.style.display = 'block';
                    viewerPlaceholder.style.display = 'none';
                });

                previewItem.addEventListener('dblclick', function (e) {
                    e.stopPropagation();
                    if (previewItem.querySelector('.inline-name-input')) return;

                    const currentName = nameDiv.textContent;

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'inline-name-input';
                    input.value = currentName;

                    nameDiv.replaceWith(input);
                    input.focus();

                    function saveName() {
                        const updatedName = input.value.trim();
                        if (updatedName && updatedName !== currentName) {
                            const idx = parseInt(previewItem.dataset.currentIndex);
                            if (idx >= 0 && idx < renamedFiles.length) {
                                const originalFile = renamedFiles[idx];
                                const updatedFile = new File([originalFile], updatedName, { type: originalFile.type });
                                renamedFiles[idx] = updatedFile;

                                nameDiv.textContent = updatedName;
                                img.alt = updatedName;
                                updateStatus(`Renamed to "${updatedName}"`, 'success');
                            }
                        } else {
                            nameDiv.textContent = currentName;
                        }
                        input.replaceWith(nameDiv);
                    }

                    input.addEventListener('blur', saveName);
                    input.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter') {
                            input.blur();
                        }
                    });
                });

                previewContainer.appendChild(previewItem);
            };

            reader.readAsDataURL(file);
        });

        downloadBtn.disabled = false;
        updateStatus(`Successfully renamed ${uploadedFiles.length} files. Review valid. Click "Download All" to save them.`, 'success');
    });

    downloadBtn.addEventListener('click', function () {
        if (renamedFiles.length === 0) {
            updateStatus('No renamed files to download. Please rename files first.', 'error');
            return;
        }

        updateStatus('Creating ZIP file...', 'success');

        const zip = new JSZip();

        renamedFiles.forEach(file => {
            zip.file(file.name, file);
        });

        zip.generateAsync({ type: 'blob' })
            .then(function (content) {
                const a = document.createElement('a');
                const url = URL.createObjectURL(content);
                a.href = url;
                a.download = 'numbered_pictures.zip';
                document.body.appendChild(a);
                a.click();

                setTimeout(function () {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 0);

                updateStatus('Download started! Your numbered pictures are in the ZIP file.', 'success');
            })
            .catch(function (error) {
                console.error('Error creating ZIP file:', error);
                updateStatus('Error creating ZIP file. Please try again.', 'error');
            });
    });

    function updateStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status';

        if (type === 'success') {
            statusDiv.classList.add('success');
        } else if (type === 'error') {
            statusDiv.classList.add('error');
        }
    }
});