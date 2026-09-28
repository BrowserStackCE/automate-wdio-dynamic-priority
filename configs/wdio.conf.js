require("dotenv").config();
const allure = require("@wdio/allure-reporter").default;

const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 20000,
  x_long: 30000,
  xx_long: 60000,
  xxx_long: 120000,
  xxxx_long: 180000,
  xxxxx_long: 240000,
  xxxxxx_long: 300000,
};

//  This is for using tags and groupings in testing.
let grepPattern;
if (process.env.INCLUDE_TAGS || process.env.EXCLUDE_TAGS) {
  let regexStr = "^";

  if (process.env.INCLUDE_TAGS) {
    regexStr += process.env.INCLUDE_TAGS.split(",")
      .map((tag) => `(?=.*${tag.trim()})`)
      .join("");
  }

  if (process.env.EXCLUDE_TAGS) {
    regexStr += process.env.EXCLUDE_TAGS.split(",")
      .map((tag) => `(?!.*${tag.trim()})`)
      .join("");
  }

  grepPattern = regexStr;
  console.log(`\n[WDIO] Filtering tests with Grep Pattern: ${grepPattern}\n`);
}

const mainConfig = {
  baseUrl: process.env[`BASE_URL_${process.env.ENVIRONMENT.toUpperCase()}`],
  runner: "local",
  specs: ["../../tests/**/*.js"],
  suites: {
    // INTEGRATION TEST SUITES (A / B / C / D / default)
    A: ["test/suites/suite-a/**/*.js"],
    B: ["test/suites/suite-b/suite-b-test*.js"],
    C: ["test/suites/suite-c/**/*.js"],
    D: ["test/suites/suite-d/**/*.js"],
    default: ["test/specs/**/*.js"],

    // UI TESTS
    allFt: ["../../tests/ui/e2e/**/*.js"],
    priorityFt: [
      "../../tests/ui/e2e/patient_onboarding/query-param-cookies*.js",
      "../../tests/ui/e2e/patient_onboarding/generated_tests/*-st.spec.js",
    ],
    doctorPriorityFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-non-hrt-patient-test-st.js",
      "../../tests/ui/e2e/doctor_dashboard/generated_tests/prescribe-had-hysterectomy-both-ovaries-removed-test-st.spec.js",
    ],
    promoFt: ["../../tests/ui/e2e/**/promo-upsell-*.js"],
    patient_onboardingFt: [
      "../../tests/ui/e2e/patient_onboarding/**/*.spec.js",
    ],
    patient_dashboardFt: [
      "../../tests/ui/e2e/patient_dashboard/**/*.js",
      "../../tests/ui/e2e/patient_dashboard/*.js",
    ],
    doctor_dashboardFt: ["../../tests/ui/e2e/doctor_dashboard/*.js"],
    patient_onboarding_successfulFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/successful-onboarding-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_with_urlParamsFt: [
      "../../tests/ui/e2e/patient_onboarding/query-param-cookies*.js",
    ],
    patient_onboarding_unsuccessfulFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/unsuccessful-onboarding-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_unsupported_stateFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/unsupported-state-onboarding-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_field_validationsFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/field-validation-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_link_validationsFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/link-validation-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_with_promocodeFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/promo-code-test-flow-*-rt.spec.js",
    ],
    patient_ssnFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/onboarding-using-ssn-test-flow-*-rt.spec.js",
      "../../tests/ui/e2e/patient_onboarding/generated_tests/extra-info-validation-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_with_ssnFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/onboarding-using-ssn-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_ui_extraFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/extra-info-validation-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_dynamic_pricingFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/dynamic-pricing-test-flow-*-st.spec.js",
    ],
    patient_onboarding_promo_upsellFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/promo-upsell-*-flow-*-rt.spec.js",
    ],
    patient_onboarding_unselect_treatmentFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/unselect-treatment-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_peanut_allergyFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/peanut-allergy-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_edit_prescriptionFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/edit-prescription-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_id_photo_persistenceFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/id-photo-persistence-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_ssn_segment_trackingFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/onboarding-using-ssn-segment-tracking-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_soft_rejection_ageFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/soft-rejection-age-*-test-rt.spec.js",
    ],
    patient_onboarding_soft_rejection_medical_conditionFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/soft-rejection-medical-condition-*-test-rt.spec.js",
    ],
    patient_onboarding_soft_rejection_multiple_medical_conditionsFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/soft-rejection-multiple-medical-conditions-test-flow-*-rt.spec.js",
    ],
    patient_onboarding_promo_code_linksFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/onboarding-using-promo-code-link-*-flow-*-rt.spec.js",
    ],
    patient_onboarding_referral_linkFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/onboarding-using-referral-link-flow-*-rt.spec.js",
    ],
    patient_onboarding_redirect_to_websiteFt: [
      "../../tests/ui/e2e/patient_onboarding/generated_tests/redirect-to-website-test-flow-*-rt.spec.js",
    ],

    patient_dashboard_account_settingsFt: [
      "../../tests/ui/e2e/patient_dashboard/account-settings-test-rt.js",
    ],
    patient_dashboard_home_navigationFt: [
      "../../tests/ui/e2e/patient_dashboard/home-navigation-test-rt-st.js",
    ],
    patient_dashboard_ssn_onboard_account_settings_id_photo_uploadFt: [
      "../../tests/ui/e2e/patient_dashboard/ssn-onboard-account-settings-id-photo-upload-test-rt.js",
    ],
    patient_dashboard_redirection_links_minoxidilFt: [
      "../../tests/ui/e2e/patient_dashboard/redirection-links-minoxidil-test-rt.js",
    ],
    patient_dashboard_soft_rejection_ageFt: [
      "../../tests/ui/e2e/patient_dashboard/generated_tests/soft-rejection-age-*-test.spec.js",
    ],
    patient_dashboard_soft_rejection_medical_conditionFt: [
      "../../tests/ui/e2e/patient_dashboard/generated_tests/soft-rejection-medical-condition-*-rt-test.spec.js",
    ],
    patient_dashboard_support_page_navigationFt: [
      "../../tests/ui/e2e/patient_dashboard/support-page-navigation-rt-st.js",
    ],
    patient_dashboard_contact_us_endpointFt: [
      "../../tests/ui/e2e/patient_dashboard/contact-us-endpoint-test-rt.js",
    ],
    patient_dashboard_followup_nps_surveyFt: [
      "../../tests/ui/e2e/patient_dashboard/followup-nps-survey-test.js",
      "../../tests/ui/e2e/patient_dashboard/fup-discount-code-test.js",
    ],
    patient_dashboard_reassignment_messagesFt: [
      "../../tests/ui/e2e/patient_dashboard/reassignment-messages-test-rt.js",
    ],
    patient_dashboard_update_state_validationFt: [
      "../../tests/ui/e2e/patient_dashboard/update-state-validation.js",
    ],
    patient_dashboard_redirect_to_supplement_shopFt: [
      "../../tests/ui/e2e/patient_dashboard/hrt-redirect-to-shop-test.js",
    ],
    patient_dashboard_promo_upsell_deep_sleep_pausedFt: [
      "../../tests/ui/e2e/patient_dashboard/promo-upsell-deep-sleep-paused-rt.js",
    ],
    doctor_followup_discounted_prescribeFt: [
      "../../tests/ui/e2e/doctor_dashboard/fup-discount-prescribe-purchase-test.js",
    ],
    doctor_schedule_followupFt: [
      "../../tests/ui/e2e/doctor_dashboard/follow-up-and-schedule-status-test.js",
    ],
    doctor_prescribe_treatmentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-*.js",
    ],
    doctor_single_prescribe_treatmentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-single-prescription-test-rt-np.js",
    ],
    doctor_multiple_prescribe_treatmentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-multiple-prescription-test-rt-np.js",
    ],
    doctor_no_refill_prescribe_treatmentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-no-refill-prescription-test-rt-np.js",
    ],
    doctor_duplicate_prescribe_treatmentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-duplicate-prescription-test-rt-np.js",
    ],
    doctor_estrogen_progesterone_prescribe_treatmentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-estrogen-progesterone-logic-prescription-test-rt-np.js",
    ],
    doctor_promoFt: [
      "../../tests/ui/e2e/doctor_dashboard/promo-upsell-prescribe-refill-estriol-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/promo-upsell-prescribe-cancel-repurchase-estriol-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/promo-upsell-estriol-active-repurchase-test.js",
      "../../tests/ui/e2e/doctor_dashboard/promo-upsell-estriol-no-refill-repurchase-test.js",
    ],
    doctor_prescription_actionsFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescription-actions-*-test-rt-np.js",
    ],
    doctor_chatFt: [
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-to-patient-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-entry-points-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-forward-message-to-admin-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/chat-screen-layout-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-to-admin-test-rt.js",
    ],
    doctor_chat_screen_layoutFt: [
      "../../tests/ui/e2e/doctor_dashboard/chat-screen-layout-test-rt-np.js",
    ],
    doctor_chat_patientFt: [
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-to-patient-test-rt-np.js",
    ],
    doctor_chat_entry_pointsFt: [
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-entry-points-test-rt-np.js",
    ],
    doctor_forward_messageFt: [
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-forward-message-to-admin-test-rt-np.js",
    ],
    doctor_google_sso_loginFt: [
      "../../tests/ui/e2e/doctor_dashboard/google-sso-login.js",
    ],
    doctor_peanut_allergyFt: [
      "../../tests/ui/e2e/doctor_dashboard/peanut-allergy-toggle-test.js",
      "../../tests/ui/e2e/doctor_dashboard/peanut-allergy-prescribe-progesterone-requested-test.js",
      "../../tests/ui/e2e/doctor_dashboard/peanut-allergy-prescribe-progesterone-not-requested-test.js",
    ],
    doctor_peanut_allergy_toggleFt: [
      "../../tests/ui/e2e/doctor_dashboard/peanut-allergy-toggle-test.js",
    ],
    doctor_peanut_allergy_prescribe_progesterone_requestedFt: [
      "../../tests/ui/e2e/doctor_dashboard/peanut-allergy-prescribe-progesterone-requested-test.js",
    ],
    doctor_peanut_allergy_prescribe_progesterone_not_requestedFt: [
      "../../tests/ui/e2e/doctor_dashboard/peanut-allergy-prescribe-progesterone-not-requested-test.js",
    ],
    doctor_peanut_allergy_patient_with_prescriptionsFt: [
      "../../tests/ui/e2e/doctor_dashboard/peanut-allergy-patient-with-prescriptions-test.js",
    ],
    doctor_peanut_allergy_prescription_cancelledFt: [
      "../../tests/ui/e2e/doctor_dashboard/generated_tests/peanut-allergy-prescription-cancelled-case-*-test.spec.js",
    ],
    doctor_saved_repliesFt: [
      "../../tests/ui/e2e/doctor_dashboard/chat-doctor-saved-replies-test-rt.js",
    ],
    doctor_soft_rejection_ageFt: [
      "../../tests/ui/e2e/doctor_dashboard/generated_tests/soft-rejection-age-*-test.spec.js",
    ],
    doctor_soft_rejection_medical_conditionFt: [
      "../../tests/ui/e2e/doctor_dashboard/generated_tests/soft-rejection-medical-condition-*-test.spec.js",
    ],
    doctor_non_doc_verificationFt: [
      "../../tests/ui/e2e/doctor_dashboard/non-doc-verification-test-rt-np.js",
    ],
    doctor_reassignment_messagesFt: [
      "../../tests/ui/e2e/doctor_dashboard/reassignment-messages-test-rt.js",
    ],
    doctor_hrt_status_updateFt: [
      "../../tests/ui/e2e/doctor_dashboard/generated_tests/hrt-status-update-*-test.spec.js",
    ],
    doctor_retry_paymentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-invalid-and-retry-payment-test-rt.js",
      "../../tests/ui/e2e/admin_dashboard/invalid-and-retry-payment-event-test-rt.js",
    ],
    doctor_monitor_inactive_doctorsFt: [
      "../../tests/ui/e2e/doctor_dashboard/monitor-inactive-doctors-test-rt.js",
    ],
    doctor_deep_sleep_prescribeFt: [
      "../../tests/ui/e2e/doctor_dashboard/promo-upsell-deep-sleep-prescribe.js",
    ],
    doctor_deep_sleep_prescription_actionsFt: [
      "../../tests/ui/e2e/doctor_dashboard/promo-upsell-deep-sleep-prescription-actions.js",
    ],
    doctor_out_of_office_pre_submission_checksFt: [
      "../../tests/ui/e2e/doctor_dashboard/out-of-office-pre-submission-checks-tests-rt-np.js",
    ],
    doctor_non_hrt_prescribe_treatmentFt: [
      "../../tests/ui/e2e/doctor_dashboard/prescribe-non-hrt-patient-test-st.js",
    ],
    doctor_prescribe_had_hysterectomy_both_ovaries_removedFt: [
      "../../tests/ui/e2e/doctor_dashboard/generated_tests/prescribe-had-hysterectomy-both-ovaries-removed-test-st.spec.js",
    ],

    admin_dismiss_needs_replyFt: [
      "../../tests/ui/e2e/admin_dashboard/admin-dismiss-needs-reply.js",
    ],
    admin_message_doctorFt: [
      "../../tests/ui/e2e/admin_dashboard/admin-message-doctor-test.js",
    ],
    admin_dashboardFt: [
      "../../tests/ui/e2e/admin_dashboard/*.js",
      "../../tests/ui/e2e/admin_dashboard/**/*.js",
    ],
    admin_navigate_urlFt: [
      "../../tests/ui/e2e/admin_dashboard/validate-navigation-links.js",
    ],
    admin_filter_patientFt: [
      "../../tests/ui/e2e/admin_dashboard/view-patient.js",
    ],
    admin_search_patientFt: [
      "../../tests/ui/e2e/admin_dashboard/search-patient.js",
    ],
    admin_patient_profileFt: [
      "../../tests/ui/e2e/admin_dashboard/patient-profile.js",
    ],
    admin_update_patient_detailsFt: [
      "../../tests/ui/e2e/admin_dashboard/update-patient-details.js",
    ],
    admin_prescription_cardsFt: [
      "../../tests/ui/e2e/admin_dashboard/prescription-cards.js",
    ],
    admin_chat_tabFt: [
      "../../tests/ui/e2e/admin_dashboard/admin-dasboard-chat-tab.js",
    ],
    admin_chat_patientFt: [
      "../../tests/ui/e2e/admin_dashboard/chat-patient.js",
    ],
    admin_chat_patient_macroFt: [
      "../../tests/ui/e2e/admin_dashboard/chat-patient-macro.js",
    ],
    admin_assign_patient_manuallyFt: [
      "../../tests/ui/e2e/admin_dashboard/assign-patient-manually.js",
    ],
    admin_assign_patient_automaticallyFt: [
      "../../tests/ui/e2e/admin_dashboard/assign-patient-automatically.js",
    ],
    admin_assign_patient_automaticallyFt: [
      "../../tests/ui/e2e/admin_dashboard/assign-patient-automatically.js",
    ],
    admin_chatFt: [
      "../../tests/ui/e2e/admin_dashboard/admin-dasboard-chat-tab.js",
      "../../tests/ui/e2e/admin_dashboard/chat*.js",
      "../../tests/ui/e2e/admin_dashboard/assign-patient-manually.js",
      "../../tests/ui/e2e/admin_dashboard/assign-patient-automatically.js",
      "../../tests/ui/e2e/admin_dashboard/chat-history-doctor-to-admin-test.js",
    ],
    admin_google_sso_loginFt: [
      "../../tests/ui/e2e/admin_dashboard/google-sso-login.js",
    ],
    admin_promoFt: [
      "../../tests/ui/e2e/admin_dashboard/promo-upsell-estriol-active-repurchase-test.js",
    ],
    admin_peanut_allergy_patient_with_prescriptionsFt: [
      "../../tests/ui/e2e/admin_dashboard/peanut-allergy-patient-with-prescriptions-test.js",
    ],
    admin_promo_upsell_minoxidil_pricing_logicFt: [
      "../../tests/ui/e2e/admin_dashboard/generated_tests/promo-upsell-minoxidil-pricing-logic-case-*-test.spec.js",
    ],
    admin_soft_rejection_ageFt: [
      "../../tests/ui/e2e/admin_dashboard/soft-rejection-age.js",
    ],
    admin_soft_rejection_medical_conditionFt: [
      "../../tests/ui/e2e/admin_dashboard/soft-rejection-medical-condition.js",
    ],
    admin_banned_patientFt: [
      "../../tests/ui/e2e/admin_dashboard/banned-patient-test.js",
    ],
    admin_delinquent_reportFt: [
      "../../tests/ui/e2e/admin_dashboard/delinquent-report-test.js",
    ],
    admin_reassignment_messagesFt: [
      "../../tests/ui/e2e/admin_dashboard/reassignment-messages.js",
    ],
    admin_issue_report: [
      "../../tests/ui/e2e/admin_dashboard/admin-apc-isssue-report-test.js",
      "../../tests/ui/e2e/admin_dashboard/issue-reported-by-admin-test.js",
      "../../tests/ui/e2e/admin_dashboard/issue-reported-by-patient-test.js",
    ],
    admin_reassignment_messages_out_of_officeFt: [
      "../../tests/ui/e2e/admin_dashboard/reassignment-message-out-of-office.js",
    ],
    admin_doctor_disable_reassignmentFt: [
      "../../tests/ui/e2e/admin_dashboard/doctor-disable-reassignment.js",
    ],
    admin_outreach_tab_state_filterFt: [
      "../../tests/ui/e2e/admin_dashboard/outreach-tabs-state-filter.js",
    ],
    admin_user_levelsFt: [
      "../../tests/ui/e2e/admin_dashboard/admin-user-levels.js",
    ],
    admin_transfer_rx_failed_payment_duplicate_invoiceFt: [
      "../../tests/ui/e2e/admin_dashboard/transfer-rx-failed-payment-duplicate-invoice.js",
    ],
    admin_hrt_status_changed_event_duplicateFt: [
      "../../tests/ui/e2e/admin_dashboard/hrt-status-changed-event-duplicate-test.js",
    ],
    admin_active_list_doctor_dashboard: [
      "../../tests/ui/e2e/admin_dashboard/list-active-doctors-dashboard-test.js",
    ],
    admin_out_of_office_back_to_original_doctorFt: [
      "../../tests/ui/e2e/admin_dashboard/out-of-office-back-to-original-doctor-test.js",
    ],
    admin_doctor_ooo_dropdown_exclusionFt: [
      "../../tests/ui/e2e/admin_dashboard/list-active-doctors-reassignment-test.js",
    ],
    admin_inactive_doctorsFt: [
      "../../tests/ui/e2e/admin_dashboard/inactive-doctors-test.js",
    ],
    admin_override_reassignment_restrictionFt: [
      "../../tests/ui/e2e/admin_dashboard/override-reassignment-restriction-test.js",
    ],
    admin_promo_upsell_deep_sleepFt: [
      "../../tests/ui/e2e/admin_dashboard/promo-upsell-deep-sleep.js",
    ],

    patient_chat_entry_pointsFt: [
      "../../tests/ui/e2e/patient_dashboard/chat-message-entry-points-test-rt.js",
    ],
    patient_chat_new_unverified_chat_doctorFt: [
      "../../tests/ui/e2e/patient_dashboard/chat-new-unverified-patient-to-doctor-test-rt.js",
    ],
    patient_chat_admin_doctorFt: [
      "../../tests/ui/e2e/patient_dashboard/chat-patient-to-admin-and-doctor-test-rt.js",
    ],
    patient_chat_support_linksFt: [
      "../../tests/ui/e2e/patient_dashboard/chat-patient-using-support-link-test-rt.js",
    ],
    patient_chatFt: [
      "../../tests/ui/e2e/patient_dashboard/chat-message-entry-points-test-rt.js",
      "../../tests/ui/e2e/patient_dashboard/chat-new-unverified-patient-to-doctor-test-rt.js",
      "../../tests/ui/e2e/patient_dashboard/chat-patient-to-admin-and-doctor-test-rt.js",
      "../../tests/ui/e2e/patient_dashboard/chat-patient-using-support-link-test-rt.js",
    ],
    patient_promoFt: [
      "../../tests/ui/e2e/patient_dashboard/generated_tests/promo-upsell-purchase-*-rt.spec.js",
      "../../tests/ui/e2e/patient_dashboard/generated_tests/promo-upsell-admin-cancel-purchase-*-rt.spec.js",
      "../../tests/ui/e2e/patient_dashboard/generated_tests/promo-upsell-doctor-cancel-purchase-*-rt.spec.js",
    ],
    apcFt: [
      //Patient
      "../../tests/ui/e2e/patient_dashboard/chat-message-entry-points-test-rt.js",
      "../../tests/ui/e2e/patient_dashboard/chat-new-unverified-patient-to-doctor-test-rt.js",
      "../../tests/ui/e2e/patient_dashboard/chat-patient-to-admin-and-doctor-test-rt.js",
      "../../tests/ui/e2e/patient_dashboard/chat-patient-using-support-link-test-rt.js",
      //Doctor
      "../../tests/ui/e2e/doctor_dashboard/chat-patient-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/chat-entry-points-test-rt-np.js",
      "../../tests/ui/e2e/doctor_dashboard/forward-message-to-admin-test-rt-np.js",
      //Admin
      "../../tests/ui/e2e/admin_dashboard/admin-dasboard-chat-tab.js",
      "../../tests/ui/e2e/admin_dashboard/chat-patient.js",
      "../../tests/ui/e2e/admin_dashboard/chat-patient-macro.js",
      "../../tests/ui/e2e/admin_dashboard/assign-patient-manually.js",
      "../../tests/ui/e2e/admin_dashboard/assign-patient-automatically.js",
      "../../tests/ui/e2e/admin_dashboard/admin-message-doctor-test.js",
    ],
    chatFt: [
      "../../tests/ui/e2e/admin_dashboard/chat*.js",
      "../../tests/ui/e2e/doctor_dashboard/chat*.js",
      "../../tests/ui/e2e/patient_dashboard/chat*.js",
    ],
    admin_patient_profile_admin_actionsFt: [
      "../../tests/ui/e2e/admin_dashboard/admin-actions.js",
    ],
    onetrust_banner_visibilityFt: [
      "../../tests/ui/e2e/patient_dashboard/onetrust-banner-visibility-test.js",
    ],
    onetrust_opt_inFt: [
      "../../tests/ui/e2e/patient_dashboard/onetrust-opt-in-banner-visibility-test.js",
      "../../tests/ui/e2e/patient_dashboard/onetrust-opt-in-test.js",
    ],
    onetrust_opt_outFt: [
      "../../tests/ui/e2e/patient_dashboard/onetrust-opt-out-test.js",
    ],

    // SMOKE TESTS
    allSt: ["../../tests/ui/**/**/*-st*.js"],

    // COMPATIBILITY TESTS
    allCt: ["../../tests/ui/compatibility/**/*.js"],
    patient_onboardingCt: [
      "../../tests/ui/compatibility/patient_onboarding/successful-patient-onboarding-test-ct.js",
    ],
    // API TESTS
    allIt: ["../../tests/api/**/*.js"],
    priorityIt: ["../../tests/api/**/*-rt*.js"],

    state_look_upIt: ["../../tests/api/functional/look-up-state-st-rt.js"],
    dosage_logicIt: ["../../tests/api/e2e/generated_tests/dosage*.spec.js"],
    onboard_user_setup: ["../../tests/setup_only/onboard-users-exclude.js"],
    build: ["../../tests/ui/e2e/patient_onboarding/query-param-cookies-e2e.js"],
  },
  exclude: [
    //* Include all existing tests that needs maintenance.
    "../../tests/ui/e2e/doctor_dashboard/google-sso-login.js",
    "../../tests/ui/e2e/admin_dashboard/google-sso-login.js",
  ],
  maxInstances: 5,
  logLevel: "info",
  bail: 0,
  waitforTimeout: TIMEOUTS.xx_long,
  connectionRetryTimeout: TIMEOUTS.xxx_long,
  connectionRetryCount: 3,
  framework: "mocha",
  reporters: [
    "spec",
    // "video",
    [
      "allure",
      {
        outputDir: "allure-results",
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
        disableMochaHooks: true,
      },
    ],
  ],

  mochaOpts: {
    timeout: TIMEOUTS.xxxxxx_long,
    ...(grepPattern && { grep: grepPattern }),
  },

  beforeSuite: async function (suite) {
    global.allure = allure;
    allure.addFeature(suite.name);
    allure.addDescription("generating Allure reports " + suite.name);
  },
  /**
   * Gets executed once before all workers get launched.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  // onPrepare: function (config, capabilities) {
  // },
  /**
   * Gets executed before a worker process is spawned and can be used to initialise specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {string} cid      capability id (e.g 0-0)
   * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {object} specs    specs to be run in the worker process
   * @param  {object} args     object that will be merged with the main configuration once worker is initialized
   * @param  {object} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just after a worker process has exited.
   * @param  {string} cid      capability id (e.g 0-0)
   * @param  {number} exitCode 0 - success, 1 - fail
   * @param  {object} specs    specs to be run in the worker process
   * @param  {number} retries  number of retries used
   */
  // onWorkerEnd: function (cid, exitCode, specs, retries) {
  // },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   * @param {string} cid worker id (e.g. 0-0)
   */
  // beforeSession: function (config, capabilities, specs, cid) {
  // },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs        List of spec file paths that are to be run
   * @param {object}         browser      instance of created browser/device session
   */
};

module.exports = { mainConfig };
