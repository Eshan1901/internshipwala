import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import './VerifyOtp.css';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'registration';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  // Auto redirect if email is missing in route state
  useEffect(() => {
    if (!email) {
      toast.error('Email parameter missing. Redirecting to login.');
      navigate('/login');
    }
  }, [email, navigate]);

  // Resend Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Allow numeric only

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace focus backward
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Numeric only

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last input or corresponding input
    const targetIdx = Math.min(pastedData.length, 5);
    inputRefs.current[targetIdx].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyOtp({
        email,
        otp_code: otpCode,
        purpose,
      });

      toast.success('OTP verified successfully!');
      
      // Auto routing based on purpose
      if (purpose === 'registration') {
        toast('Account activated. Please sign in.', { icon: '🔑' });
        navigate('/login');
      } else if (purpose === 'password_reset') {
        navigate('/reset-password', { state: { email, otp_code: otpCode } });
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp(email, purpose);
      toast.success('A new OTP has been dispatched to your email.');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      toast.error(err.message || 'Unable to resend OTP. Try again later.');
    }
  };

  return (
    <AuthLayout title="Verification" subtitle={`We have sent a 6-digit activation code to ${email}`}>
      <form onSubmit={handleSubmit} className="auth-form" id="otp-form">
        {/* OTP Input Segment */}
        <div className="otp-input-group">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="otp-digit-input"
              id={`otp-input-${idx}`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ marginTop: '2rem' }}
          id="verify-otp-btn"
        >
          {loading ? (
            <div className="spinner spinner-sm" />
          ) : (
            <>
              <ShieldCheck size={18} /> Verify Activation Code
            </>
          )}
        </button>

        {/* Resend Cooldown Section */}
        <div className="resend-container">
          {resendTimer > 0 ? (
            <p className="resend-text">
              Resend OTP in <strong>{resendTimer}s</strong>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="btn btn-ghost resend-btn"
              id="resend-otp-btn"
            >
              <RotateCcw size={14} /> Resend OTP
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
