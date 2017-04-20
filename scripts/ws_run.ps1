param($machine);
(Get-Service "$machine").Start()