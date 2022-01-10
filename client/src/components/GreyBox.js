import React from 'react';
import '../GreyBox.css'; 
import { Box } from '@material-ui/core'

const GreyBox = props => {
  return (
      <div className="flex">
        <h5 className='box-title'>
          {props.title}
        </h5>
        <Box sx={{ mx: 0, display: 'inline-block', width: '886px',
            height: '180px',
            left: '114px',
            top: '301px',
            background: 'rgba(225, 225, 225, 0.34)'}}>
            {props.content}
        </Box>
      </div>


  );
};
export default GreyBox;