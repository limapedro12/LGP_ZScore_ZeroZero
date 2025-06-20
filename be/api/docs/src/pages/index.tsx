import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import { Redirect } from 'react-router-dom';
import styles from './index.module.css';



export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
    
  return 	<Redirect to="/docs/intro" /> ;
}


