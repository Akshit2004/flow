# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - img "F" [ref=e5]
        - text: Flow
      - generic [ref=e6]:
        - link "Log in" [ref=e7] [cursor=pointer]:
          - /url: /login
          - button "Log in" [ref=e8]
        - link "Sign up" [ref=e9] [cursor=pointer]:
          - /url: /signup
          - button "Sign up" [ref=e10]
    - main [ref=e11]:
      - generic [ref=e12]:
        - img [ref=e13]
        - text: The new standard for project management
      - heading "Linear flow. Exponential speed." [level=1] [ref=e15]:
        - text: Linear flow.
        - text: Exponential speed.
      - paragraph [ref=e16]: Every detail designed for speed. Plan sprints, track progress, and ship with a tool that feels like an extension of your mind.
      - generic [ref=e17]:
        - link "Start building" [ref=e18] [cursor=pointer]:
          - /url: /signup
          - button "Start building" [ref=e19]:
            - text: Start building
            - img [ref=e20]
        - generic [ref=e22]: No credit card required
      - generic [ref=e29]:
        - generic [ref=e31]: To Do
        - generic [ref=e36]: In Progress
        - generic [ref=e45]: Done
  - button "Open Next.js Dev Tools" [ref=e54] [cursor=pointer]:
    - img [ref=e55]
  - alert [ref=e58]
```