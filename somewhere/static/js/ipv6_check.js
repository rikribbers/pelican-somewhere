/*
 * This is a modified version of the orignal version for ipv6
 *  	from https://github.com/SIDN/client_dnssec_check
 *
 * ipv6 check script
 * 
 * Include this script in your HTML, and an empty <div> with id 
 * 'sidn_ipv6_check' somewhere on the page.
 * 
 * The script automatically runs, and tries to resolve a domain name
 * that should not validate. If that succeeds it will hide the
 * 'checking' image, and shows 'sidn_ipv6_insecure'. If it does
 * not succeed, it will show the 'sidn_ipv6_secure' image.
 * 
 * Images, or replacement texts, can be changed in the calling
 * code. See example.html for an example.
 * 
 * By default, it uses an image called 1x1.png served at the
 * (non-validating) domain servfail.sidnlabs.nl. If you do not want
 * to rely on this image being served in the future, replace it with
 * an image served on a non-validating domain, and set the URL with
 * sidn_ipv6_set_test_image()
 * 
 * Notes:
 * - This relies on a timeout and hence on the speed of the resolver.
 *   We set the timeout to 2000 ms, which should be a reasonable
 *   compromise between speed and reliability, but it could result in
 *   a false negative if no DNS responses from sidnlabs.nl (or 
 *   whichever test domain is set) have been cached in the resolver.
 * - Since we only test symptoms, there are certain error conditions
 *   that result in a false positive, such as general DNS resolution
 *   failure. Care should be taken when relying on this test.
 */

// Global variable to hold settings and the timer
var sidn_ipv6 = {};
sidn_ipv6.timer = null;
sidn_ipv6.timeout = 2000;
sidn_ipv6.img_test = "//ipv6.sidnlabs.nl/1x1.png"
sidn_ipv6.icon_checking = "nodec icon-spin"
sidn_ipv6.icon_success = "nodec icon-ok"
sidn_ipv6.icon_failed = "nodec icon-nok"
sidn_ipv6.txt_checking = "Checking ipv6..."
sidn_ipv6.txt_success = "ipv6 is enabled"
sidn_ipv6.txt_failed = "ipv6 is not enabled"

//
// Setters
//

// Change the timeout value, increase if there are false positives
function sidn_ipv6_set_timeout(timeout) {
	sidn_ipv6.timeout = timeout;
}

// Change the test image. This must be an existing image, served
// on a domain that resolves without ipv6, but fails to resolve
// *with* ipv6 validation. One relatively easy way is to mangle
// the RRSIG in the signed dns zone of the domain name.
function sidn_ipv6_set_test_image(image_url) {
	sidn_ipv6.img_test = image_url;
}

// Change the icon that is shown if there is ipv6 validation
function sidn_ipv6_set_success_icon(icon) {
	sidn_ipv6.icon_success = icon;
}

// Change the text that is shown if there is ipv6 validation
function sidn_ipv6_set_success_text(text) {
	sidn_ipv6.txt_success = text;
}

// Change the icon that is shown if there is *no* ipv6 validation
function sidn_ipv6_set_failure_icon(icon) {
	sidn_ipv6.icon_failed = icon;
}

// Change the text that is shown if there is *no* ipv6 validation
function sidn_ipv6_set_failure_text(text) {
	sidn_ipv6.txt_failed = text;
}

// Change the icon that is shown while the test is waiting for results
function sidn_ipv6_set_checking_icon(icon) {
	sidn_ipv6.icon_checking = icon;
}

// Change the text that is shown while the test is waiting for results
function sidn_ipv6_set_checking_text(text) {
	sidn_ipv6.txt_checking = text;
}

//
// End of setters
//

// Update the div with given icon url and given alt text
function sidn_ipv6_set_status(icon, text) {
	html = '<h6>ipv6</h6><a class="' + icon + '" />';
	jQuery("#sidn_ipv6_check").html(html);
}

// The pixel got loaded. Obviously there is no validation
function sidn_ipv6_pixel_loaded() {
	// remove the pixel again
	jQuery('#sidn_ipv6_check_pixel').remove();
	// cancel the timer, and show failed status
	clearTimeout(sidn_ipv6.timer);
	sidn_ipv6_set_status(sidn_ipv6.icon_failed,
	                       sidn_ipv6.txt_failed)
}

// The pixel failed to load in time, so we assume the failure
// implies ipv6 validation.
function sidn_ipv6_pixel_not_loaded() {
	sidn_ipv6_set_status(sidn_ipv6.icon_success,
	                       sidn_ipv6.txt_success)
}

// The main test.
function sidn_ipv6_validation_check() {
	// Set image and text to 'running'
	sidn_ipv6_set_status(sidn_ipv6.icon_checking,
	                       sidn_ipv6.txt_checking);

	// Try to load an image that should fail. If it succeeds, there
	// is no ipv6 validation.
	jQuery('body').append('<img src="' + sidn_ipv6.img_test + '"' +
	                      'width="1" height="1" ' +
	                      'id="sidn_ipv6_check_pixel" ' +
	                      'alt="" ' +
	                      'onload="sidn_ipv6_pixel_loaded();" />')
	// Start a timer, if it times out, we have validation (since
	// the pixel never loaded).
	sidn_ipv6.timer = setTimeout(sidn_ipv6_pixel_not_loaded,
	                               sidn_ipv6.timeout);
}

// Initialize it automatically on startup.
jQuery(document).ready(sidn_ipv6_validation_check);
