import * as React from 'react';

interface InviteEmailProps {
  projectName: string;
  inviterName: string;
  inviteUrl: string;
}

export const InviteEmail: React.FC<Readonly<InviteEmailProps>> = ({
  projectName,
  inviterName,
  inviteUrl,
}) => {
  const brandColor = '#4F46E5'; // Sophisticated Indigo
  const secondaryColor = '#0F172A'; // Dark Navy
  const textColor = '#334155';
  const mutedText = '#64748B';
  const bgColor = '#F8FAFC';

  return (
    <div style={{
      backgroundColor: bgColor,
      padding: '60px 20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: textColor,
      lineHeight: '1.5',
    }}>
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        border: '1px solid #F1F5F9',
      }}>
        {/* Modern Minimalist Header */}
        <div style={{
          padding: '40px 48px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            <path d="M128 256C128 185.298 185.298 128 256 128C326.702 128 384 185.298 384 256" stroke="#2563EB" strokeWidth="48" strokeLinecap="round"/>
            <path d="M384 256C384 326.702 326.702 384 256 384C185.298 384 128 326.702 128 256" stroke="#10B981" strokeWidth="48" strokeLinecap="round"/>
            <path d="M128 256L200 256" stroke="#2563EB" strokeWidth="48" strokeLinecap="round"/>
            <path d="M312 256L384 256" stroke="#10B981" strokeWidth="48" strokeLinecap="round"/>
            <circle cx="256" cy="256" r="32" fill="#2563EB"/>
          </svg>
          <span style={{
            marginLeft: '12px',
            fontSize: '20px',
            fontWeight: '700',
            color: secondaryColor,
            letterSpacing: '-0.02em',
          }}>Flow Project</span>
        </div>

        {/* Hero Section */}
        <div style={{ padding: '48px 48px 32px', textAlign: 'center' as const }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: secondaryColor,
            marginBottom: '16px',
            letterSpacing: '-0.03em',
            lineHeight: '1.2',
          }}>
            Team Collaboration Awaits
          </h1>
          <p style={{
             fontSize: '16px',
             color: mutedText,
             maxWidth: '400px',
             margin: '0 auto',
          }}>
            Join {inviterName} and start shipping better projects together.
          </p>
        </div>

        {/* Main Invite Card */}
        <div style={{ padding: '0 48px 48px' }}>
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #F1F5F9',
            marginBottom: '40px',
          }}>
            <p style={{
              fontSize: '15px',
              fontWeight: '500',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              color: brandColor,
              marginBottom: '12px',
              textAlign: 'center' as const,
            }}>
              Active Invitation
            </p>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: secondaryColor,
              marginBottom: '8px',
              textAlign: 'center' as const,
            }}>
              {projectName}
            </h2>
            <p style={{
              fontSize: '15px',
              color: mutedText,
              textAlign: 'center' as const,
              marginBottom: '24px',
            }}>
              Work efficiently with statuses, priorities, and deadlines.
            </p>

            <div style={{ textAlign: 'center' as const }}>
              <a href={inviteUrl} style={{
                backgroundColor: brandColor,
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '16px 40px',
                display: 'inline-block',
                transition: 'all 0.2s ease',
              }}>
                Accept Invitation
              </a>
            </div>
          </div>

          {/* MNC style "Why Flow?" section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
               fontSize: '14px',
               fontWeight: '700',
               color: secondaryColor,
               textTransform: 'uppercase' as const,
               letterSpacing: '0.05em',
               marginBottom: '16px',
            }}>
              Experience Flow
            </h3>
            <div style={{ display: 'flex', marginBottom: '16px' }}>
              <div style={{ minWidth: '24px', color: brandColor }}>✓</div>
              <div style={{ marginLeft: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: secondaryColor }}>Kanban Power</strong>
                <span style={{ fontSize: '14px', color: mutedText }}>Visualize every stage of your project lifecycle.</span>
              </div>
            </div>
            <div style={{ display: 'flex', marginBottom: '16px' }}>
                <div style={{ minWidth: '24px', color: brandColor }}>✓</div>
                <div style={{ marginLeft: '12px' }}>
                  <strong style={{ display: 'block', fontSize: '14px', color: secondaryColor }}>Team Velocity</strong>
                  <span style={{ fontSize: '14px', color: mutedText }}>Assign tasks, set priorities, and hit your milestones.</span>
                </div>
              </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div style={{
          padding: '40px 48px',
          backgroundColor: '#F1F5F9',
          textAlign: 'center' as const,
        }}>
          <p style={{
            fontSize: '13px',
            color: mutedText,
            lineHeight: '20px',
            marginBottom: '16px',
          }}>
            This invitation was sent to you by {inviterName}. If you are not the intended recipient, please ignore this email.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: mutedText }}>Help Center</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: mutedText }}>Privacy Policy</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: mutedText }}>Contact Us</span>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#94A3B8',
          }}>
            &copy; {new Date().getFullYear()} Flow Inc. All rights reserved.
          </p>
        </div>
      </div>
      
      <div style={{
        textAlign: 'center' as const,
        marginTop: '32px',
      }}>
        <p style={{
          fontSize: '12px',
          color: '#94A3B8',
        }}>
          Automated System Notification &bull; Ref: INV-{Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </div>
    </div>
  );
};
