# Fix all import paths in web-frontend components

$componentsPath = "web-frontend\src\components"

# Fix patterns
$fixes = @(
    # Fix mockData imports - components at different levels
    @{
        Pattern = 'from "\.\.\/data\/mockData"'
        Replacement = 'from "../../../data/mockData"'
        Files = @("Dashboard.tsx")
    },
    @{
        Pattern = 'from "\.\.\/\.\.\/data\/mockData"'
        Replacement = 'from "../../../../data/mockData"'
        Files = @(
            "communication\ChatManager.tsx",
            "dashboard\Overview.tsx",
            "forum\ForumModule.tsx",
            "forum\UserProfile.tsx",
            "news\NewsModule.tsx",
            "organization\DepartmentManager.tsx",
            "organization\OrgChart.tsx",
            "organization\UserManager.tsx",
            "system\AlertManager.tsx",
            "system\AuditLogManager.tsx",
            "system\GeneralSettings.tsx"
        )
    },
    
    # Fix Button/Input imports - relative to component location
    @{
        Pattern = 'from "\.\.\/ui\/(Button|Input)"'
        Replacement = 'from "../system/ui/$1"'
        Files = @(
            "dashboard\ResourceManagement.tsx",
            "dashboard\Overview.tsx",
            "forum\ForumModule.tsx",
            "forum\UserProfile.tsx",
            "news\NewsModule.tsx",
            "organization\DepartmentManager.tsx",
            "organization\OrgChart.tsx",
            "organization\UserManager.tsx",
            "projects\KanbanBoard.tsx",
            "projects\ProjectDetailView.tsx",
            "projects\ProjectModule.tsx",
            "projects\TaskSettings.tsx",
            "projects\WorkflowDesigner.tsx",
            "system\AlertManager.tsx",
            "system\AuditLogManager.tsx",
            "system\GeneralSettings.tsx",
            "workspace\EventManager.tsx",
            "workspace\MeetingAdmin.tsx"
        )
    },
    
    # Fix Dashboard imports
    @{
        Pattern = 'from "\.\.\/ui\/Button"'
        Replacement = 'from "./system/ui/Button"'
        Files = @("Dashboard.tsx")
    }
)

Write-Host "`n🔧 Fixing import paths in web-frontend components...`n" -ForegroundColor Cyan

$totalFixed = 0

foreach ($fix in $fixes) {
    foreach ($file in $fix.Files) {
        $filePath = Join-Path $componentsPath $file
        
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $originalContent = $content
            
            # Apply regex replacement
            $content = $content -replace $fix.Pattern, $fix.Replacement
            
            if ($content -ne $originalContent) {
                Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
                Write-Host "✅ Fixed: $file" -ForegroundColor Green
                $totalFixed++
            }
        } else {
            Write-Host "Not found: $file" -ForegroundColor Yellow
        }
    }
}

Write-Host "" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixed $totalFixed files" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
