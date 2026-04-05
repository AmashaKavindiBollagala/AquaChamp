import validator from "email-validator";
import dns from "dns/promises";

export const isValidEmail = async (email) => {
  console.log(`📧 Starting email validation for: ${email}`);
  
  // ✅ 1. Check email format (example: user@gmail.com)
  if (!validator.validate(email)) {
    console.log(`❌ Email format invalid: ${email}`);
    return false;
  }

  // ✅ 2. Extract domain from email
  const domain = email.split("@")[1];
  console.log(`🔍 Extracted domain: ${domain}`);

  try {
    // ✅ 3. MX RECORD CHECK with timeout (3 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DNS lookup timeout')), 3000);
    });

    const mxPromise = dns.resolveMx(domain);
    const mxRecords = await Promise.race([mxPromise, timeoutPromise]);

    // If MX records exist → valid domain
    if (mxRecords && mxRecords.length > 0) {
      console.log(`✅ Valid domain - Found ${mxRecords.length} MX record(s) for: ${domain}`);
      return true;
    } else {
      console.log(`❌ No MX records found for domain: ${domain}`);
      return false;
    }
  } catch (error) {
    // If error → domain does not exist or no MX records
    console.log(`❌ Domain validation FAILED for ${domain}`);
    console.log(`   Error type: ${error.code || error.name}`);
    console.log(`   Error message: ${error.message}`);
    
    // For common fake domains, definitely block them
    const fakePatterns = [/\d{3,}/, /^[a-z]{8,}$/i];
    const domainPart = domain.split('.')[0];
    
    for (const pattern of fakePatterns) {
      if (pattern.test(domainPart)) {
        console.log(`   ⚠️ Domain matches fake pattern, blocking: ${domain}`);
        return false;
      }
    }
    
    // Treat any DNS error as invalid domain
    return false;
  }
};