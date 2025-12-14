import { FiExternalLink } from 'react-icons/fi';
import './styles/CustomStyles.css';

export const CustomCard = (props) => {
  return (
    <div className={`custom-card ${props.size}`}>
      <p className='cc-heading'>{props.heading}</p>
      <div className='cc-body'>
        <span className='cc-num'>{props.num}</span>
        <span>{props.children}</span>
      </div>
      <FiExternalLink className='cc-link' />
    </div>
  );
};

CustomCard.defaultProps = {
  size: 'md',
};
