document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileCount = document.getElementById('fileCount');
    const previewContainer = document.getElementById('previewContainer');
    const renameBtn = document.getElementById('renameBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('status');
    
    let uploadedFiles = [];
    let renamedFiles = [];
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        uploadedFiles = files;
        fileCount.textContent = `${files.length} file(s) selected`;
        
        previewContainer.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const img = document.createElement('img');
                img.className = 'preview-img';
                img.src = e.target.result;
                img.alt = file.name;
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'preview-name';
                nameDiv.textContent = file.name;
                
                previewItem.appendChild(img);
                previewItem.appendChild(nameDiv);
                previewContainer.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });
        
        renameBtn.disabled = false;
        updateStatus('Files uploaded successfully. Click "Rename to Numbers" to rename them.', 'success');
    });
    
    renameBtn.addEventListener('click', function() {
        if (uploadedFiles.length === 0) {
            updateStatus('No files to rename. Please upload images first.', 'error');
            return;
        }
        
        renamedFiles = [];
        
        previewContainer.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const extension = file.name.split('.').pop();
            const newName = `${index + 1}.${extension}`;
            
            const renamedFile = new File([file], newName, { type: file.type });
            renamedFiles.push(renamedFile);
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const img = document.createElement('img');
                img.className = 'preview-img';
                img.src = e.target.result;
                img.alt = newName;
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'preview-name';
                nameDiv.textContent = newName;
                
                previewItem.appendChild(img);
                previewItem.appendChild(nameDiv);
                previewContainer.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });
        
        downloadBtn.disabled = false;
        updateStatus(`Successfully renamed ${uploadedFiles.length} files. Click "Download All" to save them.`, 'success');
    });
    
    downloadBtn.addEventListener('click', function() {
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
            .then(function(content) {
                const a = document.createElement('a');
                const url = URL.createObjectURL(content);
                a.href = url;
                a.download = 'numbered_pictures.zip';
                document.body.appendChild(a);
                a.click();
                
                setTimeout(function() {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 0);
                
                updateStatus('Download started! Your numbered pictures are in the ZIP file.', 'success');
            })
            .catch(function(error) {
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