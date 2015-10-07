# SecondOpinion

Integrates VirusTotal.com into Mozilla Thunderbird

Imagine the following scenario. You got a strange mail but your anti virus tells you it is safe. You are unsure about it.
That's where this tools starts. It offers a convenient way to upload attachments to VirusTotal. 
VirusTotal will run your attachment through more than 50 anti-virus engines. The result is a strong indicator if the file is safe or not.

![Screenshot](https://cloud.githubusercontent.com/assets/2531380/10354103/0d824c72-6d5d-11e5-9969-a90faeff44bf.png)

Please keep in mind, that his add-on is NOT an anti-virus replacement and never will be for various reasons.
Checking a file with so many anti-virus needs time, it takes Virus Total several minutes to complete even for small files.  It's not a real-time scanner, it an on demand service. And due to the enormous amount of scan engines the chances for false positives add up. So consider the the scan result as a profound indicator and a second opinion or second wall of defence in addition to your anti-virus.

As additional bonus VirusTotal keep track about well known dangerous files and stores this information in a public database. The add-on uses this public information and checks the attachments and urls on the fly against this database. This mechanism works very similar to a Phishing or Scram detection. Well known dangerous files do not need to be scanned, you get immediately an warning if the attachment is not considered trustworthy.

By design it can only check if a file is a dangerous and not if it's safe. So no warning does not mean safe. It works vice versa and will tell you if the file is known to be harmful.

There is a 4 request per minute quota with VirusTotal. Which means at the beginning you'll see an indicator displaying you are out of quota. This will get decrease dramatically the better the local cache is trained. The only option you have is to ignore that message.


# Privacy

Please read [VirusTotal's terms of service](https://www.virustotal.com/en/about/terms-of-service/) before using the add-on.

The add-on upload as little information as possible. When checking urls only the domain part is transferred, the path and search information is dropped. 
When checking attachments the files fingerprint/checksum is uploaded and the file name is obfuscated.

But when you manually trigger a scan or rescan, the file will be uploaded to VirusTotaly. In case it is rated as a positive it will be forwarded all anti-virus manufactures for further analysis. So never upload any files which are confidential.

# API Reuse

This addon implements VirusTotal's public API 2.0 in JavaScript. As this is free and open software you may integrate this implementation into your software. You find instructions at [VirusTotal public API 2.0 in JavaScript](VIRUS TOTAL API.md)

# Bugs

Please report bugs via the [issue tracker](https://github.com/thsmi/SecondOpinion/issues) 
or send an email to schmid-thomas at gmx.net . You find more details on reporting bugs in 
the [Contributing Guidelines](https://github.com/thsmi/SecondOpinion/blob/master/CONTRIBUTING.md)

Give me 1-2 weeks time for a reply. If you did not receive a reply at all, it might be a good idea to check your spam filter. 

# License

The extension is free and open source software, it is made available to you 
under the terms of the [GNU Affero General Public License (AGPLv3)](http://www.fsf.org/licensing/licenses/agpl-3.0.html).
