'use client'

import React, { useState } from "react";
import AuthService from "../../services/auth-service";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import LoginPageIllustration from '../.././assets/login-page-illustration.svg';
import OpenEyEIcon from '../.././assets/open_eye_icon.svg';
import LoginHeader from './LoginHeader';
import { useTranslation } from 'react-i18next';
// import { LOGIN } from '../../constants';
import './style/LoginBody.css'

const LoginBody = () => {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      await AuthService.login(email, password).then(
        () => {
          router.push("/home");
          window.location.reload();
        },
        (error: any) => {
          console.log(error);
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="main">
      <div>
        <LoginHeader />
      </div>
      <div className="section">
        <div className="left">
          <div className="content">
            <div className="title_heading">{t('LOGIN.title')}</div>
            <div className="sub_title">{t('LOGIN.subTitle')}</div>
          </div>
          <div className="login_form">
            <div className="input_box">
              <label className="custom_label" htmlFor="emailInput">
                {t('LOGIN.enterEmailAddress')}
              </label>
              <input
                type="text"
                id="emailInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input_box">
              <label className="custom_label" htmlFor="passwordInput">
                {t('LOGIN.enterPassword')}
              </label>
              <input
                type="password"
                id="passwordInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="eye_icon">
                <Image src={OpenEyEIcon} alt="OpenEYE" />
              </span>
            </div>
            <div className="fogot_password">
              <a href="/forgot" className="router-link-active">
                {t('LOGIN.forgotPasswordButton')}
              </a>
            </div>
          </div>
          <div onClick={handleLogin} className="login_btn">
            {t('LOGIN.loginButton')}
          </div>
        </div>
        <div className="right">
          <Link href="#">
            <Image className="page-illustration" alt="Illustration" src={LoginPageIllustration} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginBody;