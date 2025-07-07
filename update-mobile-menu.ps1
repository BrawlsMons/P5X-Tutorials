# PowerShell script to add hamburger menu to all HTML files
$files = @(
    "answers.html",
    "guides.html", 
    "team-builds.html",
    "part-time-jobs.html",
    "romance-guide.html",
    "flower-shop.html",
    "shichi-kun.html",
    "convenience-store.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Add hamburger menu if not already present
        if ($content -notmatch "hamburger") {
            $oldPattern = '<div class="logo">\s*<a href="index\.html" class="logo-text">p5x\.space</a>\s*</div>\s*<ul class="nav-menu">'
            $newContent = @"
<div class="logo">
                    <a href="index.html" class="logo-text">p5x.space</a>
                </div>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <ul class="nav-menu">
"@
            
            $updatedContent = $content -replace $oldPattern, $newContent
            Set-Content -Path $file -Value $updatedContent -Encoding UTF8
            Write-Host "Updated $file"
        }
    }
}

Write-Host "Mobile menu update complete!"
