; ViRA QA Current State and Goals - Updated with Business Requirements
; Emergency 3-day execution plan
; Updated: September 2025

(define (problem vira-qa-current-state)
  (:domain vira-qa-fixes)

  (:objects
    ; Fixes to implement (in priority order)
    category-formatting - fix
    description-cleanup - fix
    label-fixes - fix
    pricing-display - fix
    project-counts - fix
    client-display - fix
    vendor-cost-display - fix
    vendor-detail-readonly - fix
    vendor-work-samples - fix
    client-page-enhancement - fix
    multiselect-search - fix

    ; Team members
    charles - developer
    qa-tester - tester
  )

  (:init
    ; Current state - Day 1 & 2 completed
    (available charles)
    (available qa-tester)
    (production-stable)
    (implemented category-formatting)
    (implemented description-cleanup)
    (implemented label-fixes)
    (implemented pricing-display)
    (implemented project-counts)
    (implemented client-display)

    ; Risk scores (1=lowest, 5=highest)
    (= (risk-score category-formatting) 1) ; CSS only - COMPLETED
    (= (risk-score description-cleanup) 1)  ; CSS only - COMPLETED
    (= (risk-score label-fixes) 1)         ; CSS only - COMPLETED
    (= (risk-score pricing-display) 2)     ; Read existing data - COMPLETED
    (= (risk-score project-counts) 2)      ; Read existing data - COMPLETED
    (= (risk-score client-display) 2)      ; Read existing data - COMPLETED
    (= (risk-score vendor-cost-display) 2) ; Display existing pricing data
    (= (risk-score vendor-detail-readonly) 1) ; Remove edit capabilities - low risk
    (= (risk-score vendor-work-samples) 3) ; New display logic
    (= (risk-score client-page-enhancement) 2) ; Display existing data
    (= (risk-score multiselect-search) 3)  ; Changes search logic

    ; Priority scores (1=lowest, 5=highest) - Updated for business value
    (= (priority-score category-formatting) 5) ; User-facing, easy - COMPLETED
    (= (priority-score description-cleanup) 4)  ; Cleanup - COMPLETED
    (= (priority-score label-fixes) 4)         ; Confusion fix - COMPLETED
    (= (priority-score pricing-display) 5)     ; Critical info - COMPLETED
    (= (priority-score project-counts) 4)      ; Important metric - COMPLETED
    (= (priority-score client-display) 3)      ; Nice to have - COMPLETED
    (= (priority-score vendor-cost-display) 5) ; Critical business value
    (= (priority-score vendor-detail-readonly) 5) ; Security/UX critical
    (= (priority-score vendor-work-samples) 4) ; Important credibility
    (= (priority-score client-page-enhancement) 3) ; Value clarification
    (= (priority-score multiselect-search) 4)  ; UX improvement

    ; Effort estimates (hours)
    (= (effort-hours category-formatting) 0.5) ; COMPLETED
    (= (effort-hours description-cleanup) 0.5) ; COMPLETED
    (= (effort-hours label-fixes) 0.5) ; COMPLETED
    (= (effort-hours pricing-display) 2) ; COMPLETED
    (= (effort-hours project-counts) 2) ; COMPLETED
    (= (effort-hours client-display) 2) ; COMPLETED
    (= (effort-hours vendor-cost-display) 2)
    (= (effort-hours vendor-detail-readonly) 1)
    (= (effort-hours vendor-work-samples) 3)
    (= (effort-hours client-page-enhancement) 2)
    (= (effort-hours multiselect-search) 3)

    ; Rollback times (minutes)
    (= (rollback-time category-formatting) 5) ; COMPLETED
    (= (rollback-time description-cleanup) 5) ; COMPLETED
    (= (rollback-time label-fixes) 5) ; COMPLETED
    (= (rollback-time pricing-display) 10) ; COMPLETED
    (= (rollback-time project-counts) 10) ; COMPLETED
    (= (rollback-time client-display) 10) ; COMPLETED
    (= (rollback-time vendor-cost-display) 10)
    (= (rollback-time vendor-detail-readonly) 5)
    (= (rollback-time vendor-work-samples) 15)
    (= (rollback-time client-page-enhancement) 10)
    (= (rollback-time multiselect-search) 15)

    ; CSS-only flags for safe changes
    (css-only category-formatting) ; COMPLETED
    (css-only description-cleanup) ; COMPLETED
    (css-only label-fixes) ; COMPLETED

    ; Initial metrics
    (= (test-coverage) 60) ; Day 2 completed
    (= (total-effort-spent) 12) ; Day 1 & 2 effort spent

    ; Dependencies - Updated for new business requirements
    (depends-on vendor-cost-display pricing-display)
    (depends-on vendor-work-samples vendor-detail-readonly)
    (depends-on client-page-enhancement client-display)
  )

  (:goal
    (and
      ; COMPLETED - Day 1 & 2 (All deployed)
      (deployed category-formatting)
      (deployed description-cleanup)
      (deployed label-fixes)
      (deployed pricing-display)
      (deployed project-counts)
      (deployed client-display)

      ; CRITICAL - Day 3 Business Requirements
      (deployed vendor-cost-display) ; Show costs upfront on vendor listing
      (deployed vendor-detail-readonly) ; Remove edit capability for users
      (deployed vendor-work-samples) ; Show completed projects and ratings

      ; NICE TO HAVE - Day 3 Enhancements
      (implemented client-page-enhancement) ; Add value to client page
      (implemented multiselect-search) ; Better search UX

      ; Safety requirements
      (production-stable)
      (> (test-coverage) 70)
    )
  )

  (:metric minimize (total-effort-spent))
)
