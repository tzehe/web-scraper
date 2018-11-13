import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 320,
  },
});

const ResultList = ({ results, classes }) => {
  const { data } = results;
  return (
    <Paper className={classes.root}>
      <Table className={classes.table} data-testid="result-list">
        <TableHead>
          <TableRow>
            <TableCell>Word</TableCell>
            <TableCell numeric>Frequency</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(row => {
            return (
              <TableRow key={row.word} data-testid="row">
                <TableCell component="th" scope="row">
                  {row.word}
                </TableCell>
                <TableCell numeric>{row.frequency}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};
export default withStyles(styles)(ResultList);
