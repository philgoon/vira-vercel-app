; ViRA QA Fixes Domain - Emergency Execution Plan
; Generated: September 2025
; Timeline: 3-day sprint

(define (domain vira-qa-fixes)
  (:requirements :strips :typing :fluents :negative-preconditions)

  (:types
    fix test deployment - object
    developer tester - agent
    risk-level priority-level - measure
  )

  (:predicates
    ; Implementation state
    (implemented ?f - fix)
    (tested ?f - fix)
    (deployed ?f - fix)
    (rolled-back ?f - fix)

    ; Dependencies
    (depends-on ?f1 - fix ?f2 - fix)
    (blocks ?f1 - fix ?f2 - fix)

    ; System state
    (backup-exists)
    (production-stable)
    (staging-tested)
    (users-notified)

    ; Risk management
    (safe-to-deploy ?f - fix)
    (requires-database-change ?f - fix)
    (requires-permission-check ?f - fix)
    (css-only ?f - fix)

    ; Resources
    (available ?a - agent)
    (working-on ?a - agent ?f - fix)
  )

  (:functions
    (effort-hours ?f - fix)
    (risk-score ?f - fix) ; 1-5, 1=lowest
    (priority-score ?f - fix) ; 1-5, 5=highest
    (completion-time ?f - fix)
    (rollback-time ?f - fix)
    (test-coverage)
    (total-effort-spent)
  )

  ; DAY 1 ACTIONS - Zero Risk Display Fixes

  (:action implement-category-formatting
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (backup-exists)
      (production-stable))
    :effect (and
      (implemented category-formatting)
      (not (available ?d))
      (working-on ?d category-formatting)
      (increase (total-effort-spent) 1))
  )

  (:action implement-description-cleanup
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (backup-exists))
    :effect (and
      (implemented description-cleanup)
      (not (available ?d))
      (working-on ?d description-cleanup)
      (increase (total-effort-spent) 1))
  )

  (:action implement-label-fixes
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (backup-exists))
    :effect (and
      (implemented label-fixes)
      (not (available ?d))
      (working-on ?d label-fixes)
      (increase (total-effort-spent) 1))
  )

  ; DAY 2 ACTIONS - Display Existing Data

  (:action implement-pricing-display
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (implemented category-formatting)
      (tested category-formatting))
    :effect (and
      (implemented pricing-display)
      (working-on ?d pricing-display)
      (increase (total-effort-spent) 2))
  )

  (:action implement-project-counts
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (production-stable))
    :effect (and
      (implemented project-counts)
      (working-on ?d project-counts)
      (increase (total-effort-spent) 2))
  )

  (:action implement-client-display
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (implemented project-counts))
    :effect (and
      (implemented client-display)
      (working-on ?d client-display)
      (increase (total-effort-spent) 2))
  )

  ; DAY 3 ACTIONS - User Experience & Business Value

  (:action implement-vendor-cost-display
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (implemented pricing-display)
      (tested pricing-display))
    :effect (and
      (implemented vendor-cost-display)
      (working-on ?d vendor-cost-display)
      (increase (total-effort-spent) 2))
  )

  (:action implement-vendor-detail-readonly
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (backup-exists)
      (production-stable))
    :effect (and
      (implemented vendor-detail-readonly)
      (working-on ?d vendor-detail-readonly)
      (increase (total-effort-spent) 1))
  )

  (:action implement-vendor-work-samples
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (implemented vendor-detail-readonly)
      (tested vendor-detail-readonly))
    :effect (and
      (implemented vendor-work-samples)
      (working-on ?d vendor-work-samples)
      (increase (total-effort-spent) 3))
  )

  (:action implement-client-page-enhancement
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (implemented client-display)
      (tested client-display))
    :effect (and
      (implemented client-page-enhancement)
      (working-on ?d client-page-enhancement)
      (increase (total-effort-spent) 2))
  )

  (:action implement-multiselect-search
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (implemented category-formatting)
      (tested category-formatting))
    :effect (and
      (implemented multiselect-search)
      (working-on ?d multiselect-search)
      (increase (total-effort-spent) 3))
  )

  (:action implement-project-filters
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (implemented multiselect-search)
      (tested multiselect-search))
    :effect (and
      (implemented project-filters)
      (working-on ?d project-filters)
      (increase (total-effort-spent) 2))
  )

  ; TESTING ACTIONS

  (:action test-fix
    :parameters (?t - tester ?f - fix)
    :precondition (and
      (available ?t)
      (implemented ?f)
      (not (tested ?f)))
    :effect (and
      (tested ?f)
      (safe-to-deploy ?f)
      (increase (test-coverage) 10))
  )

  ; DEPLOYMENT ACTIONS

  (:action deploy-to-vercel
    :parameters (?d - developer ?f - fix)
    :precondition (and
      (available ?d)
      (tested ?f)
      (safe-to-deploy ?f)
      (production-stable))
    :effect (and
      (deployed ?f)
      (available ?d))
  )

  (:action emergency-rollback
    :parameters (?d - developer ?f - fix)
    :precondition (and
      (deployed ?f)
      (not (production-stable)))
    :effect (and
      (rolled-back ?f)
      (not (deployed ?f))
      (production-stable)
      (available ?d))
  )

  ; BACKUP & SAFETY ACTIONS

  (:action create-backup
    :parameters (?d - developer)
    :precondition (and
      (available ?d)
      (not (backup-exists)))
    :effect (and
      (backup-exists)
      (increase (total-effort-spent) 1))
  )

  (:action verify-production-stable
    :parameters (?t - tester)
    :precondition (and
      (available ?t))
    :effect (and
      (production-stable))
  )
)
