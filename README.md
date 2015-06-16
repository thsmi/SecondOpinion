# SecondOpinion

Integrates VirusTotal.com into Mozilla Thunderbird

Imagine the following scenario. You got a strange mail but your anti virus tells you it is safe. You are unsure about it.
That's where this tools starts. It offers a convenient way to upload attachments to VirusTotal. 
VirusTotal will run your attachment through more than 50 anti-virus engines. The result is a strong indicator if the file is safe or not.

Please keep in Mind, that his add-on is NOT an anti virus replacement and never will be for various reasons.
Checking a file with so many anti virus needs time, it takes Virus Total several minutes to complete even for small files.  It's not a real-time scanner, it an on demand service. And due 
to the enormous amount of scan engines the chances for false positives add up. So consider the the scan result as an profound indicator and a second opinion or second wall of defence in addition to your antivirus.

As additional bonus VirusTotal keep track about well known dangerous files and stores this information in a public database. The addon uses this information and checks the attachments and urls on the fly against this database. This mechanism works very similar 
to a Phishing or Scram detection. Well known dangerous files do not need to be scanned. You get immediately an warning if the attachment is not considered trustworthy.

By design it can only check if a file is a dangerous and not if it's safe. So no warning does not mean safe. It works vice versa and will tell you if the file is known to be harmful.

There is a 4 request per minute quota with virus total. Which means at the beginning you'll see an indicator displaying you are out of quota. This will get decrease dramatically 
the better the local cache is trained.


Privacy

Please read VirusTotal's terms of use before using the addon.

The addon upload as little information as possible. When checking urls only the domain part is transferred, the path and search information is dropped. 
When checking attachments the files fingerprint/checksum is uploaded and the file name is obfuscated.

But in case you manually trigger a scan at virus total, you will upload the whole file. In case it is rated as a positive it will be forwarded all 
anti-virus manufactures for further analysis. 

# Bugs

Please report bugs via the issue tracker or send an email to schmid-thomas at gmx.net . You find more details on reporting bugs in the Contributing Guidelines

Give me 1-2 weeks time for a reply. If you did not receive a reply at all, it might be a good idea to check your spam filter. 

# License

The extension is free and open source software, it is made available to you under the terms of the GNU Affero General Public License (AGPLv3).

Refer to Licensing information for details.

