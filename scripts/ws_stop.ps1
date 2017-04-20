param($machine);
(Get-Service "$machine").Stop()