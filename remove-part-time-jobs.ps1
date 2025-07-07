# PowerShell script to remove Part-Time Jobs button from navigation and footer in all HTML files

# Get all HTML files in the directory
$htmlFiles = Get-ChildItem -Path . -Filter *.html

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove the Part-Time Jobs dropdown from the navigation menu
    $navPattern = '<li class="dropdown">\s*<a href="part-time-jobs\.html" class="nav-link.*?">Part-Time Jobs</a>\s*<div class="dropdown-content">\s*<a href="flower-shop\.html">Flower Shop</a>\s*<a href="shichi-kun\.html">Shichi-kun</a>\s*<a href="convenience-store\.html">Convenience Store</a>\s*</div>\s*</li>'
    $updatedContent = $content -replace $navPattern, ""
    
    # If dropdown pattern wasn't matched, try to match just the nav link (in case some files have a different structure)
    if ($updatedContent -eq $content) {
        $simpleNavPattern = '<li>\s*<a href="part-time-jobs\.html".*?>Part-Time Jobs</a>\s*</li>'
        $updatedContent = $content -replace $simpleNavPattern, ""
    }
    
    # Remove from footer quick links
    $footerPattern = '<li><a href="part-time-jobs\.html">Part-Time Jobs</a></li>'
    $updatedContent = $updatedContent -replace $footerPattern, ""
    
    # Save the updated content back to the file
    Set-Content -Path $file.FullName -Value $updatedContent -Encoding UTF8
    Write-Host "Updated $($file.Name)"
}

Write-Host "Part-Time Jobs removal complete!"
