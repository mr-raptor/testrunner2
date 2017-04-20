param($machine);
Get-Service "$machine" | Select-Object Status | ConvertTo-Json