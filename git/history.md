# Git Log

```
commit 9f3a2d1 (HEAD -> main)
Author: Kevin Brown <kbrown@taskflow.io>
Date:   Mon Mar 24 16:42:10 2025

    fix: rate limiter not resetting window on new period

commit 7b1e4c8
Author: Sarah Wright <swright@taskflow.io>
Date:   Mon Mar 24 11:15:33 2025

    feat: add billing usage tracking to task creation

commit 2d8f9a3
Author: Derek Thompson <dthompson@taskflow.io>
Date:   Fri Mar 21 14:30:22 2025

    fix: org-context middleware returning 500 instead of 404

commit e4c1b7f
Author: James Chen <jchen@taskflow.io>
Date:   Thu Mar 20 09:45:11 2025

    refactor: extract notification config into per-org settings

commit a8d3e2c
Author: Lisa Martin <lmartin@taskflow.io>
Date:   Wed Mar 19 16:20:45 2025

    feat: add slack notification channel to notification router

commit 1f7b9d4
Author: James Chen <jchen@taskflow.io>
Date:   Tue Mar 18 10:33:08 2025

    feat: migrate notification routing to user_contacts table

    - Created user_contacts table to support flexible contact preferences
    - Notification router now checks user_contacts to determine which channels to dispatch to
    - Updated email service to read from contacts-repo instead of user-repo
    - NOTE: kept users.phone_number column for backwards compat, will remove in follow-up PR

commit 5c2a8f1
Author: Sarah Wright <swright@taskflow.io>
Date:   Mon Mar 17 14:15:52 2025

    feat: add task assignment event handler with notifications

commit 3e9d1a7
Author: Derek Thompson <dthompson@taskflow.io>
Date:   Fri Mar 14 11:22:30 2025

    refactor: consolidate error handling into shared error classes

commit b6f4c2e
Author: Lisa Martin <lmartin@taskflow.io>
Date:   Thu Mar 13 09:10:15 2025

    feat: add structured logging with service prefixes

commit 8a1d5f3
Author: James Chen <jchen@taskflow.io>
Date:   Wed Mar 12 15:45:20 2025

    feat: initial notification system with sms and email services
```
